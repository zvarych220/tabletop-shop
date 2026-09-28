import { useEffect } from 'react'

export default function PageHeading({ title }) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = `${title} | Dice & Deck`
    return () => {
      document.title = previousTitle
    }
  }, [title])

  return <h1 className="page-heading">{title}</h1>
}