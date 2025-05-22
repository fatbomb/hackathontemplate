declare module '*.md' {
    const content: string
    export default content
  }
  
  declare module '*.mdx' {
    const content: string
    export default content
  }
  
  declare module '@mdx-js/react' {
    import { ComponentType, StyleHTMLAttributes } from 'react'
    
    interface MDXProps {
      children: React.ReactNode
      components?: Record<string, ComponentType<any>>
    }
    
    export class MDXProvider extends React.Component<MDXProps> {}
  }