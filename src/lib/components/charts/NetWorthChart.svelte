<script lang="ts">
  import { onMount } from 'svelte';
  import { Chart, registerables } from 'chart.js';

  Chart.register(...registerables);

  interface Props {
    data: { date: string; value: number }[];
    height?: number;
  }

  let { data, height = 300 }: Props = $props();

  let canvas = $state<HTMLCanvasElement | null>(null);
  let chart = $state<Chart | null>(null);

  onMount(() => {
    if (!canvas) return;

    chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: data.map(d => d.date),
        datasets: [{
          label: 'Net Worth',
          data: data.map(d => d.value),
          borderColor: '#1a2b4a',
          backgroundColor: 'rgba(26, 43, 74, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#1a2b4a',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#1a2b4a',
            titleFont: {
              family: "'DM Sans', sans-serif",
              size: 12
            },
            bodyFont: {
              family: "'DM Sans', sans-serif",
              size: 14,
              weight: 'bold'
            },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                return new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  notation: 'compact',
                  maximumFractionDigits: 1
                }).format(context.raw as number);
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                family: "'DM Sans', sans-serif",
                size: 11
              },
              color: '#8b8680'
            }
          },
          y: {
            grid: {
              color: 'rgba(139, 134, 128, 0.1)'
            },
            ticks: {
              font: {
                family: "'DM Sans', sans-serif",
                size: 11
              },
              color: '#8b8680',
              callback: (value) => {
                return new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  notation: 'compact',
                  maximumFractionDigits: 0
                }).format(value as number);
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });

    return () => {
      chart?.destroy();
    };
  });

  $effect(() => {
    if (chart && data) {
      chart.data.labels = data.map(d => d.date);
      chart.data.datasets[0].data = data.map(d => d.value);
      chart.update();
    }
  });
</script>

<div style="height: {height}px">
  <canvas bind:this={canvas}></canvas>
</div>
