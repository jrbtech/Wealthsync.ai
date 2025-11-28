<script lang="ts">
  import { onMount } from 'svelte';
  import { Chart, registerables } from 'chart.js';

  Chart.register(...registerables);

  interface Props {
    data: { category: string; value: number; color: string }[];
    height?: number;
  }

  let { data, height = 250 }: Props = $props();

  let canvas = $state<HTMLCanvasElement | null>(null);
  let chart = $state<Chart | null>(null);

  const defaultColors = [
    '#1a2b4a', // navy
    '#c9a962', // gold
    '#059669', // emerald
    '#7c3aed', // purple
    '#dc2626', // red
    '#0891b2', // cyan
    '#ea580c', // orange
    '#4f46e5', // indigo
  ];

  onMount(() => {
    if (!canvas) return;

    chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.category),
        datasets: [{
          data: data.map(d => d.value),
          backgroundColor: data.map((d, i) => d.color || defaultColors[i % defaultColors.length]),
          borderColor: '#fff',
          borderWidth: 3,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
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
                const total = context.dataset.data.reduce((a, b) => (a as number) + (b as number), 0) as number;
                const percentage = ((context.raw as number) / total * 100).toFixed(1);
                const value = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  notation: 'compact',
                  maximumFractionDigits: 1
                }).format(context.raw as number);
                return `${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    return () => {
      chart?.destroy();
    };
  });

  $effect(() => {
    if (chart && data) {
      chart.data.labels = data.map(d => d.category);
      chart.data.datasets[0].data = data.map(d => d.value);
      chart.data.datasets[0].backgroundColor = data.map((d, i) => d.color || defaultColors[i % defaultColors.length]);
      chart.update();
    }
  });
</script>

<div class="relative" style="height: {height}px">
  <canvas bind:this={canvas}></canvas>
</div>
