import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('Vercel deployment configuration', () => {
  it('proxies API requests before the SPA fallback', async () => {
    const raw = await readFile(resolve(process.cwd(), 'vercel.json'), 'utf8')
    const config = JSON.parse(raw)

    expect(config.buildCommand).toBe('npm run build')
    expect(config.outputDirectory).toBe('dist')
    expect(config.rewrites).toEqual([
      {
        source: '/api/:path*',
        destination: 'http://101.34.57.133:8080/api/:path*'
      },
      {
        source: '/:path*',
        destination: '/index.html'
      }
    ])
    expect(config.headers).toEqual([
      {
        source: '/api/:path*',
        headers: [
          { key: 'x-vercel-enable-rewrite-caching', value: '0' }
        ]
      }
    ])
  })
})
