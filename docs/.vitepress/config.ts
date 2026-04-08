import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Cloudflare Manager',
  description: 'Self-hosted multi-account Cloudflare management platform',
  base: '/cloudflare-manager/',

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/guide/getting-started' },
          { text: 'API', link: '/api/' },
          { text: 'GitHub', link: 'https://github.com/XimilalaXiang/cloudflare-manager' }
        ],
        sidebar: {
          '/guide/': [
            {
              text: 'Introduction',
              items: [
                { text: 'What is CF Manager?', link: '/guide/' },
                { text: 'Getting Started', link: '/guide/getting-started' },
                { text: 'Configuration', link: '/guide/configuration' }
              ]
            },
            {
              text: 'Features',
              items: [
                { text: 'Account Management', link: '/guide/accounts' },
                { text: 'Workers', link: '/guide/workers' },
                { text: 'Zones & DNS', link: '/guide/zones' },
                { text: 'Pages', link: '/guide/pages' },
                { text: 'Storage (KV/D1/R2)', link: '/guide/storage' }
              ]
            },
            {
              text: 'Deployment',
              items: [
                { text: 'Docker', link: '/guide/docker' },
                { text: 'Architecture', link: '/guide/architecture' }
              ]
            }
          ],
          '/api/': [
            {
              text: 'API Reference',
              items: [
                { text: 'Overview', link: '/api/' },
                { text: 'Authentication', link: '/api/auth' },
                { text: 'Accounts', link: '/api/accounts' },
                { text: 'Workers', link: '/api/workers' },
                { text: 'Zones & DNS', link: '/api/zones' },
                { text: 'Worker Routes', link: '/api/routes' },
                { text: 'Pages', link: '/api/pages' },
                { text: 'KV Storage', link: '/api/kv' },
                { text: 'D1 Database', link: '/api/d1' },
                { text: 'R2 Storage', link: '/api/r2' }
              ]
            }
          ]
        }
      }
    },
    zh: {
      label: '中文',
      lang: 'zh-CN',
      link: '/zh/',
      themeConfig: {
        nav: [
          { text: '指南', link: '/zh/guide/getting-started' },
          { text: 'API', link: '/zh/api/' },
          { text: 'GitHub', link: 'https://github.com/XimilalaXiang/cloudflare-manager' }
        ],
        sidebar: {
          '/zh/guide/': [
            {
              text: '介绍',
              items: [
                { text: '什么是 CF Manager？', link: '/zh/guide/' },
                { text: '快速开始', link: '/zh/guide/getting-started' },
                { text: '配置说明', link: '/zh/guide/configuration' }
              ]
            },
            {
              text: '功能',
              items: [
                { text: '账户管理', link: '/zh/guide/accounts' },
                { text: 'Workers', link: '/zh/guide/workers' },
                { text: '域名与 DNS', link: '/zh/guide/zones' },
                { text: 'Pages', link: '/zh/guide/pages' },
                { text: '存储 (KV/D1/R2)', link: '/zh/guide/storage' }
              ]
            },
            {
              text: '部署',
              items: [
                { text: 'Docker 部署', link: '/zh/guide/docker' },
                { text: '架构设计', link: '/zh/guide/architecture' }
              ]
            }
          ],
          '/zh/api/': [
            {
              text: 'API 参考',
              items: [
                { text: '概览', link: '/zh/api/' },
                { text: '认证', link: '/zh/api/auth' },
                { text: '账户', link: '/zh/api/accounts' },
                { text: 'Workers', link: '/zh/api/workers' },
                { text: '域名与 DNS', link: '/zh/api/zones' },
                { text: 'Worker 路由', link: '/zh/api/routes' },
                { text: 'Pages', link: '/zh/api/pages' },
                { text: 'KV 存储', link: '/zh/api/kv' },
                { text: 'D1 数据库', link: '/zh/api/d1' },
                { text: 'R2 存储', link: '/zh/api/r2' }
              ]
            }
          ]
        }
      }
    }
  },

  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/XimilalaXiang/cloudflare-manager' }
    ],
    search: {
      provider: 'local'
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present'
    }
  }
})
