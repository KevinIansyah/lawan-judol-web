import { useAppearance } from "@/hooks/use-appearance"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { appearance } = useAppearance()

  const getTheme = () => {
    if (appearance === 'dark') return 'dark'
    if (appearance === 'light') return 'light'
    
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  }

  return (
    <Sonner
      theme={getTheme()}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }