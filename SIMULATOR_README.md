# Physics Simulator

A one-page physics simulator built with React, Tailwind CSS, shadcn components, and Nivo charts.

## Overview

This application demonstrates a **Projectile Motion Simulator** with an interactive UI where users can adjust physics parameters and see real-time visualization of the results.

## Architecture

### Two-Panel Layout

1. **Parameters Panel (Left)** - 1/4 width
   - Input fields for physics parameters with default values
   - Reset button to restore defaults
   - Displays current value alongside input
   - Shows default value reference

2. **Plot Panel (Right)** - 3/4 width
   - Real-time visualization using Nivo charts
   - Responsive line chart showing simulation results
   - Interactive legend and tooltips

## Project Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── button.jsx       # Shadcn Button component
│   │   ├── input.jsx        # Shadcn Input component
│   │   ├── label.jsx        # Shadcn Label component
│   │   ├── card.jsx         # Shadcn Card component
│   ├── ParametersPanel.jsx  # Parameter input panel
│   └── PlotPanel.jsx        # Chart visualization panel
├── lib/
│   └── utils.js            # Utility functions (cn for className merging)
├── App.jsx                 # Main application component
├── index.css               # Tailwind CSS configuration
└── main.jsx               # React entry point
```

## Physics Simulation

The simulator currently implements **Projectile Motion** with:

- **Initial Velocity** (m/s) - Speed at launch
- **Angle** (degrees) - Launch angle
- **Gravity** (m/s²) - Gravitational acceleration (default ~9.81)
- **Mass** (kg) - Object mass (for future use)
- **Air Resistance** (proportional factor) - Drag coefficient

The simulation calculates the trajectory by:
1. Decomposing initial velocity into x and y components
2. Iterating through time steps (dt = 0.01s)
3. Applying gravity and air resistance
4. Tracking x and y positions until the projectile lands (y < 0)

## Technology Stack

- **React 18.3** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless UI components
- **shadcn Components** - Pre-built accessible components
- **Nivo** - React charting library
- **Lucide React** - Icon library
- **React Hook Form** - Form state management
- **class-variance-authority** - CSS class management

## Setup & Development

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Customization

### Adding New Physics Simulations

1. Create a new simulator function in `App.jsx`
2. Define its parameters in `DEFAULT_PARAMETERS`
3. Pass the data to `PlotPanel`

### Styling

- Modify `tailwind.config.js` for theme configuration
- CSS variables are defined in `src/index.css`
- Components use Tailwind utility classes

### Components

All UI components are in `src/components/ui/`:
- Extend existing components by editing their files
- Follow the shadcn component pattern with CVA for variants

## Features

✅ Real-time simulation on parameter change
✅ Parameter validation and defaults
✅ Reset to defaults button
✅ Interactive Nivo chart visualization
✅ Responsive two-panel layout
✅ Dark/modern theme with gradient background
✅ Accessibility-first component design
✅ Smooth animations and transitions

## Future Enhancements

- Add more physics simulations (pendulum, springs, etc.)
- Export results as CSV/JSON
- Multiple simultaneous simulations
- Custom color themes
- Parameter presets
- Comparison view

## License

MIT

