import '@testing-library/jest-dom'

// Polyfill for TextEncoder/TextDecoder (required by Prisma in Node.js)
import { TextEncoder, TextDecoder } from 'util'

Object.assign(global, {
  TextEncoder,
  TextDecoder,
})
