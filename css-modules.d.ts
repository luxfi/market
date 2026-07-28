// TypeScript 7 reports TS2882 for a side-effect import with no type
// declaration ("Cannot find module or type declarations for side-effect import
// of './globals.css'"). TS 5.x accepted these silently.
//
// Stylesheets are resolved by the bundler (Next/Vite/webpack), never by the
// TypeScript module resolver, so this declares them legitimate rather than
// giving them a shape.
declare module '*.css';
