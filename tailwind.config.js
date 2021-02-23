module.exports = {
	// @see https://tailwindcss.com/docs/upcoming-changes
	future: {
		removeDeprecatedGapUtilities: true,
		purgeLayersByDefault: true,
	},
	purge: ['./src/components/**/*.{js,ts,jsx,tsx}', './src/pages/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {},
	},
	variants: {},
	plugins: [
		require( 'tailwindcss' ),
		require( 'precss' ),
		require( 'autoprefixer' ),
		require('tailwind-filter-utilities'),
	]
}