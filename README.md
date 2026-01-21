# GreenSpaceMap

**GreenSpaceMap** is a modern, high-performance web application designed to help users discover and explore urban green spaces. Built with Next.js 16 and Leaflet, it provides an interactive experience for finding parks, forests, gardens, and recreation grounds in real-time.

**Live Demo:** [greenspacemap.gabrielnathanael.site](https://greenspacemap.gabrielnathanael.site)

## Features

- **Smart GPS Integration**: Automatically detects user location (with permission) to center the map and fetch nearby data.
- **Dynamic Map Exploration**: Integrated with OpenStreetMap data via Overpass API with smart fetching based on map bounds.
- **Advanced Filtering**: Filter green spaces by type (Park, Forest, Garden, etc.) and size (Small, Medium, Large).
- **Smart Sorting**: Sort results by distance (Nearest), Name (A-Z), or Size (Largest).
- **High-Rate Performance**: Implements debounced fetching and rate-limiting to ensure a smooth user experience.
- **Quick Routing**: One-click shortcuts to Get Directions via Walking, Driving, or Biking (using external map integrations).
- **Fully Responsive**: Premium UI/UX design that works flawlessly on desktop, tablet, and mobile devices.
- **Modern Tech Stack**: Built for speed and accessibility using the latest web technologies.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Mapping**: [Leaflet](https://leafletjs.com/) & [React Leaflet](https://react-leaflet.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Toaster**: [Sonner](https://sonner.stevenly.me/)
- **Data Source**: [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API) (OpenStreetMap)

## Getting Started

### Prerequisites

- Node.js 18.x or later
- pnpm (recommended) or npm/yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/GabrielNathanael/green-space-map.git
   cd green-space-map
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add any necessary keys (if applicable).

4. Run the development server:

   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

## Author

**Gabriel Nathanael**

- GitHub: [@GabrielNathanael](https://github.com/GabrielNathanael)
- Website: [gabrielnathanael.site](https://gabrielnathanael.site)
