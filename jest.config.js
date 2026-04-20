module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@tiptap/.*|tiptap-markdown|@aarkue/.*|react-syntax-highlighter|refractor|hastscript|hast-util-.*|unist-util-.*|decode-named-character-reference|character-entities|character-reference-invalid|property-information|space-separated-tokens|comma-separated-tokens|vfile-.*|parse-entities|remark-.*|rehype-.*|micromark.*|mdast-util-.*|bail|trough|unified|is-plain-obj|is-.*|character-.*|web-namespaces)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  collectCoverageFrom: [
    'utils/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
  ],
  setupFilesAfterEnv: [],
};
