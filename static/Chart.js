let originalLabels = [];
let originalData = [];

let chart;

async function loadColumns() {
  const response_x = await fetch('/column-list-for-x');
  const data_x = await response_x.json();
  const response_y = await fetch('/column-list-for-y');
  const data_y = await response_y.json();
  if (data_x.columns) {
    const xSelect = document.getElementById('x-axis');
    const ySelect = document.getElementById('y-axis');
    xSelect.innerHTML = '';
    ySelect.innerHTML = '';
    data_x.columns.forEach(col => {
      const optX = document.createElement('option');
      optX.value = col;
      optX.textContent = col;
      xSelect.appendChild(optX);
    });
    data_y.columns.forEach(col => {
      const optY = document.createElement('option');
      optY.value = col;
      optY.textContent = col;
      ySelect.appendChild(optY);
    });
    // opcjonal defaults
    xSelect.value = data_x.columns[0];
    ySelect.value = data_y.columns[1] || data_y.columns[0];
  }
}

async function loadColumns2() {
  const response = await fetch('/column-list-for-y');
  const data = await response.json();
  if (data.columns) {
    const xSelect = document.getElementById('x-axis');
    const ySelect = document.getElementById('y-axis');
    xSelect.innerHTML = '';
    ySelect.innerHTML = '';
    data.columns.forEach(col => {
      const optX = document.createElement('option');
      optX.value = col;
      optX.textContent = col;
      xSelect.appendChild(optX);

      const optY = document.createElement('option');
      optY.value = col;
      optY.textContent = col;
      ySelect.appendChild(optY);
    });
    xSelect.value = data.columns[0];
    ySelect.value = data.columns[1] || data.columns[0];
  }
}

function switchChartType(type) {
  if (chart) {
    chart.destroy();
  }

  if (type === 'scatter') {
    loadColumns2();
  } else {
    loadColumns();
  }

  // nowy chart
  const ctx = document.getElementById('myChart').getContext('2d');
  chart = new Chart(ctx, {
    type: type,
    data: {
      labels: [],
      datasets: [
        {
          label: ' ',
          data: [],
          borderColor: 'rgba(0, 123, 255, 1)',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: ' ',
          data: [],
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: {
          display: true,
          text: 'Porównanie podgatunków'
        }
      },
      scales: {
        x: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'Oś X'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Oś Y'
          }
        }
      }
    }
  });

  loadData();
}

async function loadSubspecies() {
  const response = await fetch('/subspecies-list');
  const data = await response.json();
  const select1 = document.getElementById('subspecies-select');
  const select2 = document.getElementById('genome-table-select');
  select1.innerHTML = '<option value="">Wszystkie</option>';
  select2.innerHTML = '<option value="">Wszystkie</option>';
  if (data.subspecies) {
    data.subspecies.forEach(sub => {
      const opt1 = document.createElement('option');
      opt1.value = sub;
      opt1.textContent = sub;
      select1.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = sub;
      opt2.textContent = sub;
      select2.appendChild(opt2);
    });
  }
}

async function loadData() {
    const x = document.getElementById('x-axis').value;
    const y = document.getElementById('y-axis').value;
    const subspecies1 = document.getElementById('subspecies-select').value;
    const subspecies2 = document.getElementById('genome-table-select').value;


    const response = await fetch(`/chart-data?x=${x}&y=${y}&subspecies1=${encodeURIComponent(subspecies1)}&subspecies2=${encodeURIComponent(subspecies2)}`);
    const data = await response.json();

    if (data.error) {
      alert("Błąd ładowania danych: " + data.error);
      return;
    }

    //originalLabels = data.labels;
    //originalData = data.values;

    chart.data.labels = data.labels1.length > data.labels2.length ? data.labels1 : data.labels2;
    chart.data.datasets[0].data = data.values1;
    chart.data.datasets[1].data = data.values2;

    chart.data.datasets[0].label = subspecies1 || 'Podgatunek 1';
    chart.data.datasets[1].label = subspecies2 || 'Podgatunek 2';

    chart.options.scales.x.title.text = x;
    chart.options.scales.y.title.text = y;

    chart.update();
}

function updateChart(filteredLabels, filteredData) {
    chart.data.labels = filteredLabels;
    chart.data.datasets[0].data = filteredData;
    chart.update();
}



window.addEventListener('DOMContentLoaded', async () => {
    await loadSubspecies();
    await loadColumns();

    const ctx = document.getElementById('myChart').getContext('2d');

    //document.getElementById('subspecies-select').addEventListener('change', loadData);

    //const x = document.getElementById('subspecies-select').value;
    //const y = document.getElementById('genome-table-select').value;
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: ' ',
            data: [],
            borderColor: 'rgba(0, 123, 255, 1)',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            fill: false,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: ' ',
            data: [],
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            fill: false,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          title: {
            display: true,
            text: 'Porównanie podgatunków'
          }
        },
        scales: {
          x: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Oś X'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Oś Y'
            }
          }
        }
      }
    });

    //do przeładowania danych przy zmianie osi
    document.getElementById('subspecies-select').addEventListener('change', loadData);
    document.getElementById('genome-table-select').addEventListener('change', loadData);
    document.getElementById('x-axis').addEventListener('change', loadData);
    document.getElementById('y-axis').addEventListener('change', loadData);


    // Obsługa filtrów
    /*document.getElementById('range').addEventListener('change', applyFilters);
    document.getElementById('minValue').addEventListener('input', applyFilters);
    document.getElementById('maxValue').addEventListener('input', applyFilters);
    document.getElementById('reset').addEventListener('click', () => 
    {
      updateChart(originalLabels, originalData);
      document.getElementById('range').value = 'all';
      document.getElementById('minValue').value = 0;
      document.getElementById('maxValue').value = 30;
    });*/

    await loadData(); // Załaduj dane przy starcie
    //applyFilters();    // Od razu przefiltruj
});




//między loadData a window.addEventListener
/*function filterData(range, min, max) {
      let labels = [...originalLabels];
      let data = [...originalData];

      // Zakres (np. ostatnie 3)
      if (range !== 'all') {
        const count = parseInt(range);
        labels = labels.slice(-count);
        data = data.slice(-count);
      }

      // Filtr min/max
      const filteredLabels = [];
      const filteredData = [];

      data.forEach((value, index) => {
        if (value >= min && value <= max) 
        {
          filteredLabels.push(labels[index]);
          filteredData.push(value);
        }
      });

      updateChart(filteredLabels, filteredData);
}*/

/*function applyFilters() {
      const range = document.getElementById('range').value;
      const min = parseFloat(document.getElementById('minValue').value);
      const max = parseFloat(document.getElementById('maxValue').value);

      if (isNaN(min) || isNaN(max)) {
        alert("Proszę wprowadzić poprawne wartości min i max.");
      return;
    }

    filterData(range, min, max);
}*/

/*function switchChartType(type) {
  const script = document.getElementById('chartTypeScript');
  script.src = `../static/${type}Chart.js`;
  script.onload = function() {
    // Optionally re-create the chart here using the new chart type's function
    // For example: 
    initScatterChart(ctx, data, options);
  };
}*/
