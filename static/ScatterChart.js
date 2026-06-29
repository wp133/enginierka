export function initScatterChart(scatterData) {
  const ctx = document.getElementById('myChart').getContext('2d');

  new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Sample Scatter Data',
        data: scatterData, // Expects array of {x: value, y: value}
        backgroundColor: 'rgba(75, 192, 192, 0.6)'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: {
          display: true,
          text: 'Scatter Chart Example'
        }
      },
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          title: {
            display: true,
            text: 'X Axis'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Y Axis'
          }
        }
      }
    }
  });
}
