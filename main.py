from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
import os
from werkzeug.utils import secure_filename
import mysql.connector
import pandas as pd
from pymongo import MongoClient
from pymongo.server_api import ServerApi
import bcrypt
from datetime import datetime, timedelta
import hashlib

#########Setup############
app = Flask(__name__)
app.secret_key = 'tajny_klucz' #mongo pass gRfF5l6FlN0aZKgp for user a_user
app.config['UPLOAD_FOLDER'] = 'upload'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

app.permanent_session_lifetime = timedelta(minutes=15)

users = {
    'admin': 'root',
    'user': 'password'
}

#Mongo setup
uri = "mongodb+srv://a_user:gRfF5l6FlN0aZKgp@genomics.njtfiec.mongodb.net/?retryWrites=true&w=majority&appName=genomics"
mongo_client = MongoClient(uri, server_api=ServerApi('1'))
#mongo_client = MongoClient('mongodb://localhost:27017/')
mongo_db = mongo_client['gen_admins']
mongo_users = mongo_db['admins']

# MySQL setup
db_config = {
    'host': 'localhost',
    'user': 'youser',
    'password': 'haslo',
    'database': 'genomics'
}

@app.before_request
def make_session_permanent():
    session.permanent = True

##############################

#Home
@app.route('/')
def home():
    #tables = get_table_names() #tables=tables
    return render_template('page.html') #user=session.get('user')

#Podgatunki endpoint
@app.route('/subspecies-list')
def subspecies_list():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("SELECT DISTINCT subspecies FROM genes")
        subspecies = [row[0] for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        return jsonify({'subspecies': subspecies})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

#Lista kolumn endpoint
@app.route('/column-list-for-y')
def column_list_for_y():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("SELECT COLUMN_NAME from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA = 'genomics' and TABLE_NAME = 'genes' and COLUMN_KEY != 'MUL' and DATA_TYPE IN ('tinyint', 'smallint', 'mediumint','int', 'bigint', 'decimal','bit', 'float', 'double');")
        columns = [row[0] for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        # Optional filter 
        return jsonify({'columns': columns})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/column-list-for-x')
def column_list_for_x():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("SELECT COLUMN_NAME from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA = 'genomics' and TABLE_NAME = 'genes' and COLUMN_KEY != 'MUL';")
        columns = [row[0] for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        # Optional filter 
        return jsonify({'columns': columns})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

#Dane wykresu endpoint
@app.route('/chart-data')
def chart_data():
    x_column = request.args.get('x', 'gene_symbol')
    y_column = request.args.get('y', 'protein_purity')
    subspecies1 = request.args.get('subspecies1', '')
    subspecies2 = request.args.get('subspecies2', '')

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        def fetch_data(subspecies):
            query = f"SELECT `{x_column}`, `{y_column}` FROM genes"
            params = []
            if subspecies:
                query += " WHERE subspecies = %s"
                params.append(subspecies)
            query += " ORDER BY gene_symbol ASC"
            cursor.execute(query, params)
            rows = cursor.fetchall()
            labels = [row[0] for row in rows]
            values = [int(row[1]) for row in rows]
            return labels, values

        labels1, values1 = fetch_data(subspecies1)
        labels2, values2 = fetch_data(subspecies2)

        cursor.close()
        conn.close()

        return jsonify({
            'labels1': labels1,
            'values1': values1,
            'labels2': labels2,
            'values2': values2
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


#Upload csv endpoint
@app.route('/upload', methods=['POST'])
def upload():
    if 'user' not in session:
        flash('Musisz być zalogowany.', 'error')
        return redirect(url_for('login'))

    file = request.files.get('csv_file')
    if not file or not file.filename.endswith('.csv'):
        flash('Wybierz poprawny plik .csv.', 'error')
        return redirect(url_for('home'))

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    try:
        df = pd.read_csv(filepath)

        expected_columns = {'gene_symbol','owner_hashcode', 'protein_role', 'chromosomal_location', 'protein_concentration', 'protein_purity', 'subspecies'}
        if not expected_columns.issubset(df.columns):
            flash('Nieprawidłowy format CSV.', 'error')
            return redirect(url_for('home'))

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        #if conn.is_connected():
        #    print("✅ Successfully connected to MySQL database")
        #else:
        #    print("❌ Could not connect to MySQL database")
        for _, row in df.iterrows():
            cursor.execute(
                "INSERT INTO genes (gene_symbol,owner_hashcode, protein_role, chromosomal_location, protein_concentration, protein_purity, subspecies) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (row['gene_symbol'], 
                 row['owner_hashcode'], 
                 int(row['protein_role']), 
                 int(row['chromosomal_location']), 
                 int(row['protein_concentration']), 
                 int(row['protein_purity']), 
                 row['subspecies'])
            )

        conn.commit()
        cursor.close()
        conn.close()

    except Exception as e:
        flash(f'Błąd podczas zapisu: {e}', 'error')

    finally:
        if os.path.exists(filepath):
            os.remove(filepath)

    return redirect(url_for('home'))

#Dodaj ownera endpoint
@app.route('/owner-input', methods=['POST'])
def owner_input():
    if 'user' not in session:
        flash('Musisz być zalogowany.', 'error')
        return redirect(url_for('login'))
    owner_name = request.form.get('user_new_id')
    if not owner_name:
        flash('Brak nazwy obiektu.', 'error')
        return redirect(url_for('home'))

    owner_hashcode = hashlib.sha256(owner_name.encode('utf-8')).hexdigest()

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        cursor.execute("SELECT 1 FROM owners WHERE owner_name = %s", (owner_name,))
        if cursor.fetchone():
            flash('Taki obiekt już istnieje.', 'error')
        else:
            cursor.execute(
                "INSERT INTO owners (owner_hashcode, owner_name) VALUES (%s, %s)",
                (owner_hashcode, owner_name)
            )
            conn.commit()
            flash(f'Dodano obiekt: {owner_name}', 'success')
        cursor.close()
        conn.close()
    except Exception as e:
        flash(f'Błąd podczas dodawania obiektu: {e}', 'error')

    return redirect(url_for('home'))

#Rejestracja endpoint
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password'].encode('utf-8')

        if users.find_one({'username': username}):
            return 'Użytkownik już istnieje.'

        hashed = bcrypt.hashpw(password, bcrypt.gensalt())
        users.insert_one({'username': username, 'password': hashed})
        return redirect(url_for('login'))

    return render_template('register.html')

# Login endpoint
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        user = mongo_users.find_one({'username': username, 'password': password})
        if user:
            session['user'] = username
            session.permanent = True
            return redirect(url_for('home'))
        else:
            flash("Błąd logowania: nieprawidłowa nazwa użytkownika lub hasło.", "error")
            return redirect(url_for('login'))
    return render_template('login.html')

# Logout endpoint
@app.route('/logout')
def logout():
    session.pop('user', None)
    flash('Zostałeś wylogowany.', 'info')
    return redirect(url_for('home'))


if __name__ == '__main__':
    app.run(debug=True)

