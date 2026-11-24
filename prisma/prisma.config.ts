import { definePrismaConfig } from '@prisma/internals'

export default definePrismaConfig({
  datasources: {
    db: {
      url: {
        fromEnvVar: 'DATABASE_URL',
      },
    },
  },
})
