CREATE DATABASE IF NOT EXISTS genomics;

USE genomics;

CREATE USER IF NOT EXISTS'youser'@'localhost' IDENTIFIED BY 'haslo';
GRANT ALL PRIVILEGES ON genomics.* TO 'youser'@'localhost';
FLUSH PRIVILEGES;

CREATE TABLE IF NOT EXISTS owners (
    owner_hashcode CHAR(128) PRIMARY KEY,
    owner_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS genes (
    gene_symbol VARCHAR(20) PRIMARY KEY,
    owner_hashcode CHAR(128) NOT NULL,
    protein_role INT,
    chromosomal_location INT,
    protein_concentration INT,
    protein_purity INT,
    subspecies VARCHAR(100) NOT NULL, -- do wyw
    FOREIGN KEY (owner_hashcode) REFERENCES owners(owner_hashcode)
);



