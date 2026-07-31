import {
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  ogUrl,
} from './seo'
import { TOOLS } from './tools/registry'

import type { ToolMeta } from './tools/registry'

type SchemaNode = Record<string, unknown>

export interface Crumb {
  name: string
  path: string
}

export function schemaGraph(...nodes: Array<SchemaNode>): SchemaNode {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes,
  }
}

export function organizationNode(): SchemaNode {
  return {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo512.png`,
      width: 512,
      height: 512,
    },
  }
}

export function websiteNode(): SchemaNode {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description: SITE_DESCRIPTION,
    inLanguage: 'en',
    publisher: { '@id': `${SITE_URL}/#organization` },
  }
}

export function webPageNode({
  name,
  description,
  path,
  updated,
  image,
}: {
  name: string
  description: string
  path: string
  updated: string
  image: string
}): SchemaNode {
  return {
    '@type': 'WebPage',
    '@id': `${SITE_URL}${path}#webpage`,
    url: `${SITE_URL}${path}`,
    name,
    description,
    inLanguage: 'en',
    dateModified: updated,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    primaryImageOfPage: { '@type': 'ImageObject', url: image },
  }
}

export function toolkitAppNode(): SchemaNode {
  return {
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}/#app`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description: SITE_DESCRIPTION,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires a modern browser with JavaScript enabled.',
    featureList: TOOLS.map((tool) => tool.name),
    isPartOf: { '@id': `${SITE_URL}/#website` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }
}

export function toolListNode(): SchemaNode {
  return {
    '@type': 'ItemList',
    name: `${SITE_NAME} tools`,
    numberOfItems: TOOLS.length,
    itemListElement: TOOLS.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: tool.name,
      url: `${SITE_URL}${tool.to}`,
    })),
  }
}

export function softwareAppNode(tool: ToolMeta): SchemaNode {
  return {
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}${tool.to}#app`,
    name: tool.name,
    url: `${SITE_URL}${tool.to}`,
    description: tool.metaDescription ?? tool.description,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    image: ogUrl(tool.id),
    isPartOf: { '@id': `${SITE_URL}/#website` },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }
}

export function collectionPageNode({
  name,
  description,
  path,
  tools,
}: {
  name: string
  description: string
  path: string
  tools: Array<ToolMeta>
}): SchemaNode {
  return {
    '@type': 'CollectionPage',
    name,
    description,
    url: `${SITE_URL}${path}`,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: tools.length,
      itemListElement: tools.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: tool.name,
        url: `${SITE_URL}${tool.to}`,
      })),
    },
  }
}

export function articleNode({
  headline,
  description,
  path,
  published,
  updated,
  image,
}: {
  headline: string
  description: string
  path: string
  published: string
  updated: string
  image: string
}): SchemaNode {
  return {
    '@type': 'Article',
    headline,
    description,
    url: `${SITE_URL}${path}`,
    datePublished: published,
    dateModified: updated,
    image,
    author: { '@type': 'Person', name: SITE_AUTHOR },
    publisher: { '@type': 'Organization', name: SITE_NAME },
    isPartOf: { '@id': `${SITE_URL}/#website` },
  }
}

export function faqNode(faq: Array<{ q: string; a: string }>): SchemaNode {
  return {
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}

export function breadcrumbNode(trail: Array<Crumb>): SchemaNode {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  }
}
