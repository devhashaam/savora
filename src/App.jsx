import { Route, Routes } from 'react-router-dom'
import Header from './components/Header.jsx'
import Home from './pages/Home.jsx'
import RecipeOverlay from './components/RecipeOverlay.jsx'

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <Routes>
        {/* The recipe opens as an overlay on top of the grid, so the card can expand into it */}
        <Route path="/" element={<Home />}>
          <Route path="recipe/:id" element={<RecipeOverlay />} />
        </Route>
        <Route path="*" element={<Home />} />
      </Routes>
      <footer className="footer">
        Demo project by <a href="https://devhashaam.github.io/">Muhammad Hashaam</a> · Recipes from{' '}
        <a href="https://www.themealdb.com/">TheMealDB</a>
      </footer>
    </>
  )
}
