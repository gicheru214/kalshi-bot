import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export function startAppTour() {
  if (localStorage.getItem('app_tour_seen')) return

  const d = driver({
    animate: true,
    overlayOpacity: 0.7,
    stagePadding: 6,
    stageRadius: 10,
    allowClose: true,
    popoverClass: 'pf-tour-popover',
    doneBtnText: 'Start Trading →',
    nextBtnText: 'Next →',
    prevBtnText: '← Back',
    onDestroyed: () => {
      localStorage.setItem('app_tour_seen', '1')
    },
    steps: [
      {
        element: '#featured-markets',
        popover: {
          title: '🔥 Featured Markets',
          description: "These are today's hottest markets hand-picked by volume and momentum. Great place to start.",
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#category-tabs',
        popover: {
          title: '📂 Filter by Category',
          description: 'Switch between Crypto, Stocks, Politics, Sports and more. Your vertical preferences are saved.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#market-search',
        popover: {
          title: '🔍 Search Any Market',
          description: 'Type any keyword — "bitcoin", "election", "Fed" — to find exactly what you want to trade.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#sort-controls',
        popover: {
          title: '📊 Sort by What Matters',
          description: 'Sort by Volume, Trending, Newest, or Ending Soon to find the best opportunities in seconds.',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '#market-grid',
        popover: {
          title: '💡 Trade YES or NO',
          description: 'Click any card to see the full order book and place a trade. Each contract pays $1 if it resolves in your favor.',
          side: 'top',
          align: 'start',
        },
      },
    ],
  })

  d.drive()
}
