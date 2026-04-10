module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  plugins: ["react", "react-hooks"],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/no-unknown-property": ["error", { ignore: ["args", "position", "rotation", "wireframe", "transparent", "metalness", "roughness", "emissive", "emissiveIntensity", "intensity", "distance", "attach", "count", "array", "itemSize", "sizeAttenuation", "blending", "side", "castShadow", "receiveShadow", "envMapIntensity", "angle", "penumbra", "shadow-mapSize", "shadow-bias", "makeDefault", "enableZoom", "enablePan", "minDistance", "maxDistance", "maxPolarAngle", "anchorX", "anchorY", "fontSize"] }],
  },
  ignorePatterns: ["dist/", "node_modules/"],
}
