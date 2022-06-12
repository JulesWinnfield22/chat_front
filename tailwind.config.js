module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      boxShadow: {
        'sidenav-b': '0px 1px 3px -1px #0003',
        'textarea': '0 .3px 6px -3.5px #000',
        'dark': '0 0 10rem -4px #0007',
        'toggle': '0 0 0 2px #0000, 0 0 1px 0px #000',
        'modal': '20px 20px 0 0 #0008'
      },
      fontFamily: {
        'roboto': ['Roboto', 'sans-serif'],
        'oxygen': ['Oxygen', 'sans-serif']
      }
    },
  },
  plugins: [],
}
