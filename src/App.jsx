import { useState } from 'react'
import axios from 'axios'

const API_KEY = import.meta.env.VITE_SPOONACULAR_KEY

const FOOD_EMOJIS = ['🍕','🍔','🌮','🍜','🍣','🥗','🍰','🥘','🍱','🥙','🍛','🧆']

const SUGGESTED = [
  'chicken','garlic','onion','tomato','egg',
  'rice','pasta','butter','cheese','potato',
  'spinach','mushroom','lemon','ginger','carrot'
]

const DIETS = ['Any','Vegetarian','Vegan','Gluten Free','Keto','Paleo']

export default function App() {
  const [input, setInput] = useState('')
  const [tags, setTags] = useState([])
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [diet, setDiet] = useState('Any')
  const [sort, setSort] = useState('match')
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites')
    return saved ? JSON.parse(saved) : []
  })
  const [tab, setTab] = useState('search')

  const addTag = (val) => {
    const v = (val || input).trim().toLowerCase()
    if (v && !tags.includes(v)) setTags([...tags, v])
    setInput('')
  }

  const removeTag = (tag) => setTags(tags.filter(t => t !== tag))

  const search = async () => {
    if (tags.length === 0) return
    setLoading(true)
    try {
      const res = await axios.get(
        'https://api.spoonacular.com/recipes/findByIngredients',
        { params: {
          apiKey: API_KEY,
          ingredients: tags.join(','),
          number: 12,
          ranking: sort === 'match' ? 1 : 2
        }}
      )
      setRecipes(res.data)
      setTab('search')
    } catch {
      alert('API error! Check your key.')
    }
    setLoading(false)
  }

  const toggleFav = (recipe) => {
    const exists = favorites.find(f => f.id === recipe.id)
    const updated = exists
      ? favorites.filter(f => f.id !== recipe.id)
      : [...favorites, recipe]
    setFavorites(updated)
    localStorage.setItem('favorites', JSON.stringify(updated))
  }

  const isFav = (id) => favorites.some(f => f.id === id)
  const display = tab === 'favorites' ? favorites : recipes
  const suggested = SUGGESTED.filter(s => !tags.includes(s)).slice(0, 8)

  return (
    <div style={{minHeight:'100vh', background:'#0d0d0d', fontFamily:"'Segoe UI', sans-serif", overflowX:'hidden'}}>

      {/* Floating food emojis */}
      <div style={{position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden'}}>
        {FOOD_EMOJIS.map((emoji, i) => (
          <div key={i} style={{
            position:'absolute',
            fontSize:`${Math.random()*30+20}px`,
            left:`${(i/FOOD_EMOJIS.length)*100}%`,
            top:`${Math.random()*100}%`,
            opacity:0.06,
            animation:`float${i%3} ${6+i}s ease-in-out infinite`,
            animationDelay:`${i*0.5}s`
          }}>{emoji}</div>
        ))}
      </div>

      <style>{`
        @keyframes float0{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-30px) rotate(10deg)}}
        @keyframes float1{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-50px) rotate(-10deg)}}
        @keyframes float2{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-20px) rotate(5deg)}}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes pulse-glow{0%,100%{box-shadow:0 0 20px rgba(233,69,96,0.3)}50%{box-shadow:0 0 60px rgba(233,69,96,0.8)}}
        .card-hover{transition:all 0.3s cubic-bezier(0.4,0,0.2,1)}
        .card-hover:hover{transform:translateY(-8px) scale(1.02);box-shadow:0 25px 50px rgba(233,69,96,0.3)!important}
        .recipe-card img{transition:transform 0.5s ease}
        .recipe-card:hover img{transform:scale(1.1)}
        .suggest-btn:hover{background:rgba(233,69,96,0.3)!important;border-color:#e94560!important}
        .diet-btn:hover{opacity:0.8}
        input::placeholder{color:rgba(255,255,255,0.4)}
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-track{background:#1a1a2e}
        ::-webkit-scrollbar-thumb{background:#e94560;border-radius:3px}
      `}</style>

      {/* Hero */}
      <div style={{
        position:'relative', zIndex:1,
        background:'linear-gradient(135deg, #1a0a0a 0%, #1a1a2e 40%, #0d1b3e 100%)',
        borderBottom:'1px solid rgba(233,69,96,0.3)',
        padding:'60px 20px 50px', textAlign:'center'
      }}>
        <div style={{
          position:'absolute', inset:0,
          backgroundImage:'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200)',
          backgroundSize:'cover', backgroundPosition:'center',
          opacity:0.08, filter:'blur(2px)'
        }}/>
        <div style={{position:'relative', zIndex:2}}>
          <div style={{fontSize:70, marginBottom:16, filter:'drop-shadow(0 0 30px rgba(233,69,96,0.8))'}}>🍳</div>
          <h1 style={{
            fontSize:'clamp(36px,6vw,64px)', fontWeight:900, color:'white', margin:'0 0 12px',
            background:'linear-gradient(135deg, #fff 0%, #e94560 50%, #ff6b6b 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            backgroundSize:'200%', animation:'shimmer 3s linear infinite'
          }}>Recipe Finder</h1>
          <p style={{color:'rgba(255,255,255,0.6)', fontSize:18, margin:0}}>
            ✨ Discover amazing recipes from ingredients you already have
          </p>
          <div style={{display:'flex', justifyContent:'center', gap:32, marginTop:32}}>
            {[['🥗','Fresh','Recipes'],['⚡','Instant','Search'],['♥','Save','Favorites'],['🥦','Nutrition','Info']].map(([icon,a,b])=>(
              <div key={a} style={{textAlign:'center'}}>
                <div style={{fontSize:24}}>{icon}</div>
                <div style={{color:'white', fontWeight:700, fontSize:14}}>{a}</div>
                <div style={{color:'rgba(255,255,255,0.4)', fontSize:12}}>{b}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1100, margin:'0 auto', padding:'40px 20px 60px', position:'relative', zIndex:1}}>

        {/* Search Card */}
        <div style={{
          background:'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
          backdropFilter:'blur(20px)',
          border:'1px solid rgba(233,69,96,0.3)',
          borderRadius:28, padding:32, marginBottom:24,
          boxShadow:'0 8px 32px rgba(0,0,0,0.4)'
        }}>
          <h2 style={{color:'white', fontWeight:800, fontSize:20, marginBottom:20}}>
            🧺 What's in your fridge?
          </h2>

          {/* Tags */}
          <div style={{display:'flex', flexWrap:'wrap', gap:8, marginBottom:16, minHeight:32}}>
            {tags.map(tag => (
              <span key={tag} style={{
                background:'linear-gradient(135deg, #e94560, #c23152)',
                color:'white', padding:'6px 14px', borderRadius:999,
                fontSize:13, fontWeight:600,
                display:'flex', alignItems:'center', gap:8,
                boxShadow:'0 4px 15px rgba(233,69,96,0.4)'
              }}>
                {tag}
                <button onClick={() => removeTag(tag)} style={{
                  background:'none', border:'none', color:'white',
                  cursor:'pointer', fontSize:18, lineHeight:1, padding:0
                }}>×</button>
              </span>
            ))}
          </div>

          {/* Input */}
          <div style={{display:'flex', gap:12, marginBottom:16}}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTag()}
              placeholder="🥕 Type an ingredient and press Enter..."
              style={{
                flex:1, padding:'14px 20px',
                background:'rgba(255,255,255,0.08)',
                border:'1px solid rgba(255,255,255,0.15)',
                borderRadius:16, color:'white', fontSize:15
              }}
            />
            <button onClick={() => addTag()} style={{
              padding:'14px 24px',
              background:'linear-gradient(135deg, #e94560, #c23152)',
              border:'none', borderRadius:16, color:'white',
              fontWeight:700, cursor:'pointer', fontSize:15,
              boxShadow:'0 4px 20px rgba(233,69,96,0.4)'
            }}>+ Add</button>
          </div>

          {/* Quick suggestions */}
          <div style={{marginBottom:20}}>
            <p style={{color:'rgba(255,255,255,0.4)', fontSize:12, marginBottom:8}}>
              💡 Quick add:
            </p>
            <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
              {suggested.map(s => (
                <button key={s} className="suggest-btn" onClick={() => addTag(s)} style={{
                  padding:'5px 12px', borderRadius:999, fontSize:12, fontWeight:600,
                  background:'rgba(255,255,255,0.06)',
                  border:'1px solid rgba(255,255,255,0.15)',
                  color:'rgba(255,255,255,0.7)', cursor:'pointer',
                  transition:'all 0.2s'
                }}>+ {s}</button>
              ))}
            </div>
          </div>

          {/* Diet filter */}
          <div style={{marginBottom:20}}>
            <p style={{color:'rgba(255,255,255,0.4)', fontSize:12, marginBottom:8}}>
              🥗 Diet preference:
            </p>
            <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
              {DIETS.map(d => (
                <button key={d} className="diet-btn" onClick={() => setDiet(d)} style={{
                  padding:'6px 16px', borderRadius:999, fontSize:12, fontWeight:600,
                  border:'none', cursor:'pointer', transition:'all 0.2s',
                  background: diet===d
                    ? 'linear-gradient(135deg, #e94560, #c23152)'
                    : 'rgba(255,255,255,0.08)',
                  color: diet===d ? 'white' : 'rgba(255,255,255,0.6)'
                }}>{d}</button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div style={{marginBottom:20}}>
            <p style={{color:'rgba(255,255,255,0.4)', fontSize:12, marginBottom:8}}>
              📊 Sort by:
            </p>
            <div style={{display:'flex', gap:8}}>
              {[['match','Best Match'],['missing','Fewest Missing']].map(([val,label]) => (
                <button key={val} onClick={() => setSort(val)} style={{
                  padding:'6px 16px', borderRadius:999, fontSize:12, fontWeight:600,
                  border:'none', cursor:'pointer',
                  background: sort===val
                    ? 'linear-gradient(135deg, #e94560, #c23152)'
                    : 'rgba(255,255,255,0.08)',
                  color: sort===val ? 'white' : 'rgba(255,255,255,0.6)'
                }}>{label}</button>
              ))}
            </div>
          </div>

          {/* Search button */}
          <button onClick={search} disabled={tags.length===0} style={{
            width:'100%', padding:16,
            background: tags.length>0
              ? 'linear-gradient(135deg, #e94560 0%, #c23152 50%, #e94560 100%)'
              : 'rgba(255,255,255,0.1)',
            backgroundSize:'200%',
            border:'none', borderRadius:18,
            color:'white', fontSize:17, fontWeight:800,
            cursor: tags.length>0 ? 'pointer' : 'not-allowed',
            opacity: tags.length>0 ? 1 : 0.4,
            animation: tags.length>0 ? 'pulse-glow 2s infinite' : 'none'
          }}>
            {loading ? '🔍 Searching...' : '🍽️ Find Recipes →'}
          </button>
        </div>

        {/* Tabs */}
        <div style={{display:'flex', gap:12, marginBottom:28}}>
          {['search','favorites'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding:'10px 24px', borderRadius:999, border:'none',
              fontWeight:700, fontSize:14, cursor:'pointer',
              background: tab===t
                ? 'linear-gradient(135deg, #e94560, #c23152)'
                : 'rgba(255,255,255,0.08)',
              color: tab===t ? 'white' : 'rgba(255,255,255,0.5)',
              boxShadow: tab===t ? '0 4px 20px rgba(233,69,96,0.4)' : 'none'
            }}>
              {t==='favorites' ? `♥ Favorites (${favorites.length})` : '🍴 Results'}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{textAlign:'center', padding:'80px 20px'}}>
            <div style={{fontSize:60, animation:'float0 1s ease-in-out infinite'}}>🍳</div>
            <p style={{color:'rgba(255,255,255,0.6)', fontSize:18, marginTop:16}}>
              Finding delicious recipes...
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && display.length===0 && (
          <div style={{textAlign:'center', padding:'80px 20px'}}>
            <div style={{fontSize:70, marginBottom:16}}>
              {tab==='favorites' ? '💔' : '🥗'}
            </div>
            <p style={{color:'rgba(255,255,255,0.5)', fontSize:18}}>
              {tab==='favorites'
                ? 'No favorites yet. Heart a recipe!'
                : 'Add ingredients above to find recipes!'}
            </p>
          </div>
        )}

        {/* Recipe Grid */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:24}}>
          {display.map((recipe, i) => (
            <div key={recipe.id} className="card-hover recipe-card" style={{
              background:'linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))',
              border:'1px solid rgba(255,255,255,0.1)',
              borderRadius:24, overflow:'hidden',
              boxShadow:'0 8px 32px rgba(0,0,0,0.3)',
              animation:`fadeInUp 0.5s ease ${i*0.08}s both`
            }}>
              <div style={{position:'relative', overflow:'hidden'}}>
                <img src={recipe.image} alt={recipe.title}
                  style={{width:'100%', height:200, objectFit:'cover', display:'block'}} />
                <div style={{
                  position:'absolute', inset:0,
                  background:'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)'
                }}/>
                <button onClick={() => toggleFav(recipe)} style={{
                  position:'absolute', top:12, right:12,
                  width:38, height:38, borderRadius:'50%',
                  background:'rgba(0,0,0,0.6)', border:'none',
                  color: isFav(recipe.id) ? '#e94560' : 'white',
                  fontSize:18, cursor:'pointer', backdropFilter:'blur(10px)'
                }}>{isFav(recipe.id) ? '♥' : '♡'}</button>
              </div>
              <div style={{padding:20}}>
                <h3 style={{color:'white', fontWeight:700, fontSize:15, marginBottom:12, lineHeight:1.4}}>
                  {recipe.title}
                </h3>
                <div style={{display:'flex', gap:8, flexWrap:'wrap', marginBottom:16}}>
                  <span style={{
                    background:'rgba(34,197,94,0.15)', color:'#4ade80',
                    padding:'4px 10px', borderRadius:999, fontSize:12, fontWeight:600
                  }}>✅ {recipe.usedIngredientCount} matched</span>
                  {recipe.missedIngredientCount > 0 && (
                    <span style={{
                      background:'rgba(251,146,60,0.15)', color:'#fb923c',
                      padding:'4px 10px', borderRadius:999, fontSize:12, fontWeight:600
                    }}>⚠️ {recipe.missedIngredientCount} missing</span>
                  )}
                </div>
                <button onClick={() => setSelected(recipe.id)} style={{
                  width:'100%', padding:12,
                  background:'linear-gradient(135deg, #e94560, #c23152)',
                  border:'none', borderRadius:14,
                  color:'white', fontWeight:700, fontSize:14, cursor:'pointer',
                  boxShadow:'0 4px 15px rgba(233,69,96,0.3)'
                }}>View Recipe + Nutrition →</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && <RecipeModal id={selected} onClose={() => setSelected(null)} apiKey={API_KEY} />}
    </div>
  )
}

function NutritionBar({ label, value, max, color }) {
  const pct = Math.min((value/max)*100, 100)
  return (
    <div style={{marginBottom:10}}>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:4}}>
        <span style={{color:'rgba(255,255,255,0.7)', fontSize:13}}>{label}</span>
        <span style={{color:'white', fontSize:13, fontWeight:600}}>{Math.round(value)}{label==='Calories'?'kcal':'g'}</span>
      </div>
      <div style={{background:'rgba(255,255,255,0.1)', borderRadius:999, height:8, overflow:'hidden'}}>
        <div style={{
          width:`${pct}%`, height:'100%', borderRadius:999,
          background:`linear-gradient(90deg, ${color}, ${color}99)`,
          transition:'width 1s ease'
        }}/>
      </div>
    </div>
  )
}

function RecipeModal({ id, onClose, apiKey }) {
  const [recipe, setRecipe] = useState(null)
  const [activeTab, setActiveTab] = useState('ingredients')

  useState(() => {
    axios.get(`https://api.spoonacular.com/recipes/${id}/information`,
      { params: { apiKey, includeNutrition: true } })
      .then(res => setRecipe(res.data))
  }, [id])

  const getNutrient = (name) => {
    const n = recipe?.nutrition?.nutrients?.find(n => n.name === name)
    return n ? n.amount : 0
  }

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:50,
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:16, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(12px)'
    }}>
      <div style={{
        width:'100%', maxWidth:680, maxHeight:'90vh', overflowY:'auto',
        borderRadius:28,
        background:'linear-gradient(135deg, #1a0a0a, #1a1a2e)',
        border:'1px solid rgba(233,69,96,0.3)',
        boxShadow:'0 25px 80px rgba(233,69,96,0.3)'
      }}>
        {!recipe ? (
          <div style={{padding:80, textAlign:'center'}}>
            <div style={{fontSize:50, animation:'float0 1s infinite'}}>🍳</div>
            <p style={{color:'rgba(255,255,255,0.5)', marginTop:16}}>Loading recipe...</p>
          </div>
        ) : (
          <>
            {/* Image */}
            <div style={{position:'relative'}}>
              <img src={recipe.image} alt={recipe.title}
                style={{width:'100%', height:240, objectFit:'cover', borderRadius:'28px 28px 0 0'}} />
              <div style={{
                position:'absolute', inset:0, borderRadius:'28px 28px 0 0',
                background:'linear-gradient(to top, #1a1a2e 0%, transparent 60%)'
              }}/>
              <button onClick={onClose} style={{
                position:'absolute', top:16, right:16,
                width:40, height:40, borderRadius:'50%',
                background:'rgba(0,0,0,0.7)', border:'none',
                color:'white', fontSize:22, cursor:'pointer'
              }}>×</button>
            </div>

            <div style={{padding:28}}>
              <h2 style={{color:'white', fontWeight:900, fontSize:22, marginBottom:16}}>
                {recipe.title}
              </h2>

              {/* Meta */}
              <div style={{display:'flex', flexWrap:'wrap', gap:10, marginBottom:20}}>
                {[
                  ['⏱', `${recipe.readyInMinutes} min`],
                  ['👤', `${recipe.servings} servings`],
                  ...(recipe.vegetarian ? [['🥦','Vegetarian']] : []),
                  ...(recipe.vegan ? [['🌱','Vegan']] : []),
                  ...(recipe.glutenFree ? [['🌾','Gluten Free']] : []),
                ].map(([icon, label]) => (
                  <span key={label} style={{
                    background:'rgba(255,255,255,0.08)',
                    color:'#93c5fd', padding:'6px 14px',
                    borderRadius:999, fontSize:13, fontWeight:600
                  }}>{icon} {label}</span>
                ))}
              </div>

              {/* Tabs */}
              <div style={{display:'flex', gap:8, marginBottom:20}}>
                {['ingredients','instructions','nutrition'].map(t => (
                  <button key={t} onClick={() => setActiveTab(t)} style={{
                    padding:'8px 16px', borderRadius:999, border:'none',
                    fontSize:13, fontWeight:600, cursor:'pointer',
                    background: activeTab===t
                      ? 'linear-gradient(135deg, #e94560, #c23152)'
                      : 'rgba(255,255,255,0.08)',
                    color: activeTab===t ? 'white' : 'rgba(255,255,255,0.5)'
                  }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
                ))}
              </div>

              {/* Ingredients Tab */}
              {activeTab==='ingredients' && (
                <ul style={{
                  display:'grid', gridTemplateColumns:'1fr 1fr',
                  gap:8, padding:0, listStyle:'none'
                }}>
                  {recipe.extendedIngredients?.map(ing => (
                    <li key={ing.id} style={{
                      color:'#93c5fd', fontSize:13,
                      display:'flex', gap:6, alignItems:'flex-start'
                    }}>
                      <span style={{color:'#e94560', fontWeight:700}}>•</span>
                      {ing.original}
                    </li>
                  ))}
                </ul>
              )}

              {/* Instructions Tab */}
              {activeTab==='instructions' && (
                <div style={{color:'rgba(255,255,255,0.6)', fontSize:14, lineHeight:1.8}}
                  dangerouslySetInnerHTML={{ __html: recipe.instructions || 'No instructions available.' }} />
              )}

              {/* Nutrition Tab */}
              {activeTab==='nutrition' && (
                <div>
                  <p style={{color:'rgba(255,255,255,0.4)', fontSize:12, marginBottom:16}}>
                    Per serving • Based on {recipe.servings} servings
                  </p>

                  {/* Calorie highlight */}
                  <div style={{
                    background:'linear-gradient(135deg, rgba(233,69,96,0.2), rgba(194,49,82,0.1))',
                    border:'1px solid rgba(233,69,96,0.3)',
                    borderRadius:16, padding:'16px 20px', marginBottom:20,
                    textAlign:'center'
                  }}>
                    <div style={{color:'#e94560', fontSize:40, fontWeight:900}}>
                      {Math.round(getNutrient('Calories'))}
                    </div>
                    <div style={{color:'rgba(255,255,255,0.6)', fontSize:14}}>Calories per serving</div>
                  </div>

                  {/* Nutrition bars */}
                  <NutritionBar label="Protein" value={getNutrient('Protein')} max={50} color="#4ade80" />
                  <NutritionBar label="Carbohydrates" value={getNutrient('Carbohydrates')} max={300} color="#60a5fa" />
                  <NutritionBar label="Fat" value={getNutrient('Fat')} max={65} color="#f59e0b" />
                  <NutritionBar label="Fiber" value={getNutrient('Fiber')} max={25} color="#a78bfa" />
                  <NutritionBar label="Sugar" value={getNutrient('Sugar')} max={50} color="#f472b6" />

                  {/* Nutrition grid */}
                  <div style={{
                    display:'grid', gridTemplateColumns:'1fr 1fr',
                    gap:10, marginTop:16
                  }}>
                    {[
                      ['🧂','Sodium', getNutrient('Sodium'), 'mg'],
                      ['🦴','Calcium', getNutrient('Calcium'), 'mg'],
                      ['🩸','Iron', getNutrient('Iron'), 'mg'],
                      ['💊','Vitamin C', getNutrient('Vitamin C'), 'mg'],
                    ].map(([icon, name, val, unit]) => (
                      <div key={name} style={{
                        background:'rgba(255,255,255,0.05)',
                        borderRadius:12, padding:'12px 14px',
                        border:'1px solid rgba(255,255,255,0.08)'
                      }}>
                        <div style={{fontSize:20, marginBottom:4}}>{icon}</div>
                        <div style={{color:'white', fontWeight:700, fontSize:16}}>
                          {Math.round(val)}{unit}
                        </div>
                        <div style={{color:'rgba(255,255,255,0.4)', fontSize:12}}>{name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <a href={recipe.sourceUrl} target="_blank" rel="noreferrer" style={{
                display:'inline-block', marginTop:24, padding:'12px 28px',
                background:'linear-gradient(135deg, #e94560, #c23152)',
                borderRadius:14, color:'white', fontWeight:700,
                textDecoration:'none', fontSize:15,
                boxShadow:'0 4px 20px rgba(233,69,96,0.4)'
              }}>View Full Recipe →</a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}