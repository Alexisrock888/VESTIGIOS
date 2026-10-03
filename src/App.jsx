import { useEffect, useMemo, useState } from 'react'

const collectionImageFiles = import.meta.glob('../images/*.{jpeg,jpg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const dressImageFiles = import.meta.glob('../images/Vestidos/*.{jpeg,jpg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const designerName = 'Yilian Dayanna Pérez Carvajal'

function createCollection(files, prefix) {
  return Object.entries(files)
    .sort(([first], [second]) => first.localeCompare(second, 'es', { numeric: true }))
    .map(([path, image], index) => ({
      id: `${prefix}-${index + 1}`,
      name: `${prefix === 'vestido' ? 'Vestido' : 'Diseño'} de autor ${String(index + 1).padStart(2, '0')}`,
      designer: designerName,
      description: `Diseño original creado por ${designerName}.`,
      category: prefix === 'vestido' ? 'Vestidos' : 'Diseño de autor',
      tag: prefix === 'vestido' ? 'Colección de vestidos' : 'Diseño independiente',
      image,
      fileName: path.split('/').pop(),
    }))
}

const products = createCollection(collectionImageFiles, 'pieza').filter(
  (product) => product.name !== 'Diseño de autor 04',
)
const dressProducts = createCollection(dressImageFiles, 'vestido')
const demoDesignerAccount = {
  id: 'demo-yilian',
  name: designerName,
  brand: 'VESTIGIOS Estudio',
  country: 'Colombia',
  municipality: 'Bogotá',
  email: 'disenadora@vestigios.co',
  phone: '+57 300 123 4567',
  password: 'Vestigios2025!',
  collection: [...products, ...dressProducts],
}

const categories = [
  { name: 'Colección', count: `${products.length} piezas de autor`, src: products[0]?.image, href: '#coleccion' },
  { name: 'Vestidos', count: `${dressProducts.length} diseños`, src: dressProducts[0]?.image, href: '#coleccion-vestidos' },
  { name: 'Diseñadores', count: 'Conoce sus historias', image: 'photo-1529139574466-a303027c1d8b', href: '#disenadores' },
]

function Icon({ name, size = 20, ...props }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, ...props }
  const paths = {
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></>,
    heart: <path d="M20.8 8.8c0 5.1-8.8 10.2-8.8 10.2S3.2 13.9 3.2 8.8A4.6 4.6 0 0 1 12 6.4a4.6 4.6 0 0 1 8.8 2.4Z"/>,
    bag: <><path d="M5 8h14l1 12H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    leaf: <><path d="M20 4c-8 0-14 3-14 10a6 6 0 0 0 6 6c7 0 10-7 8-16Z"/><path d="M4 21c3-5 7-8 12-11"/></>,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></>,
  }
  return <svg {...common}>{paths[name]}</svg>
}

function Photo({ id, src, alt, className = '', ...props }) {
  return <img className={className} src={src ?? `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=85`} alt={alt} loading="lazy" {...props} />
}

function App() {
  const [activeCategory, setActiveCategory] = useState('Todo')
  const [favorites, setFavorites] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [designerPortalOpen, setDesignerPortalOpen] = useState(false)
  const [designerView, setDesignerView] = useState('login')
  const [designerAccounts, setDesignerAccounts] = useState([demoDesignerAccount])
  const [activeDesigner, setActiveDesigner] = useState(null)
  const [designerError, setDesignerError] = useState('')
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  useEffect(() => {
    if (!cartOpen && !designerPortalOpen) return undefined
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setCartOpen(false)
        setDesignerPortalOpen(false)
      }
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [cartOpen, designerPortalOpen])

  const filteredProducts = useMemo(() => products.filter((product) => {
    const categoryMatch = activeCategory === 'Todo' || product.category === activeCategory
    const searchMatch = `${product.name} ${product.designer} ${product.category} ${product.description}`.toLowerCase().includes(searchQuery.toLowerCase())
    return categoryMatch && searchMatch
  }), [activeCategory, searchQuery])

  const filteredDresses = useMemo(() => dressProducts.filter((product) => (
    `${product.name} ${product.designer} ${product.description}`.toLowerCase().includes(searchQuery.toLowerCase())
  )), [searchQuery])

  const renderProductCard = (product) => (
    <article className="product-card" key={product.id}>
      <div className="product-image-wrap">
        <Photo src={product.image} alt={`${product.name}. ${product.description}`} className="product-photo" />
        <span className="product-tag">{product.tag}</span>
        <button className={`favorite-button ${favorites.includes(product.id) ? 'is-favorite' : ''}`} aria-label={favorites.includes(product.id) ? 'Quitar de favoritos' : 'Guardar en favoritos'} onClick={() => toggleFavorite(product.id)}><Icon name="heart" size={19} /></button>
        <button className="quick-add" onClick={() => addToCart(product)}>Añadir a la bolsa <Icon name="arrow" size={15} /></button>
      </div>
      <div className="product-info"><div><span className="designer-name">{product.designer}</span><h3>{product.name}</h3></div><strong>Consultar</strong></div>
      <p className="product-description">{product.description}</p>
    </article>
  )

  const toggleFavorite = (id) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const addToCart = (product) => {
    setCartItems((items) => {
      const existingItem = items.find((item) => item.product.id === product.id)
      if (existingItem) {
        return items.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...items, { product, quantity: 1 }]
    })
    setCartOpen(true)
  }
  const changeQuantity = (productId, change) => setCartItems((items) => items.map((item) => (
    item.product.id === productId ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
  )))
  const removeFromCart = (productId) => setCartItems((items) => items.filter((item) => item.product.id !== productId))
  const openDesignerPortal = (view) => {
    setDesignerError('')
    setDesignerView(view)
    setDesignerPortalOpen(true)
  }
  const loginDesigner = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = formData.get('email').trim().toLowerCase()
    const password = formData.get('password')
    const account = designerAccounts.find((designer) => designer.email.toLowerCase() === email && designer.password === password)
    if (!account) {
      setDesignerError('No encontramos una cuenta con esos datos. Revisa tu correo y contraseña.')
      return
    }
    setActiveDesigner(account)
    setDesignerError('')
    setDesignerView('dashboard')
  }
  const registerDesigner = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = formData.get('email').trim().toLowerCase()
    if (designerAccounts.some((designer) => designer.email.toLowerCase() === email)) {
      setDesignerError('Ya existe una cuenta con ese correo. Inicia sesión para continuar.')
      return
    }
    const account = {
      id: `designer-${Date.now()}`,
      name: formData.get('name').trim(),
      brand: formData.get('brand').trim(),
      country: 'Colombia',
      municipality: formData.get('municipality').trim(),
      email,
      phone: formData.get('phone').trim(),
      password: formData.get('password'),
      collection: [],
    }
    setDesignerAccounts((accounts) => [...accounts, account])
    setActiveDesigner(account)
    setDesignerError('')
    setDesignerView('dashboard')
  }

  return (
    <>
      <div className="announcement">Diseño independiente, historias que se quedan <span>·</span> Envíos a toda Colombia</div>
      <header className="site-header">
        <button className="icon-button mobile-menu-button" aria-label="Abrir menú" onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? 'close' : 'menu'} /></button>
        <a className="wordmark" href="#inicio" aria-label="Vestigios inicio">VESTIGIOS<span>®</span><small>MODA CON HISTORIA</small></a>
        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Navegación principal">
          <a href="#coleccion" onClick={() => setMenuOpen(false)}>Colección</a>
          <a href="#coleccion-vestidos" onClick={() => setMenuOpen(false)}>Vestidos</a>
          <a href="#categorias" onClick={() => setMenuOpen(false)}>Explorar</a>
          <a href="#disenadores" onClick={() => setMenuOpen(false)}>Diseñadores</a>
          <a href="#historia" onClick={() => setMenuOpen(false)}>Nuestra historia</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button search-toggle" aria-label="Buscar" onClick={() => setSearchOpen(!searchOpen)}><Icon name="search" /></button>
          <a className="sell-link" href="#disenadores">Vende con nosotros</a>
          <button className="icon-button bag-button" aria-label={`Abrir bolsa, ${cartCount} productos`} onClick={() => setCartOpen(true)}><Icon name="bag" />{cartCount > 0 && <span className="bag-count">{cartCount}</span>}</button>
        </div>
      </header>
      {searchOpen && <div className="search-panel"><Icon name="search" /><input autoFocus placeholder="Busca una pieza, diseñador o estilo..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} /><button className="icon-button" aria-label="Cerrar búsqueda" onClick={() => { setSearchOpen(false); setSearchQuery('') }}><Icon name="close" /></button></div>}

      <main>
        <section className="hero" id="inicio">
          <Photo id="photo-1539109136881-3be0616acf4b" alt="Editorial de moda independiente con una silueta expresiva" className="hero-image" />
          <div className="hero-shade" />
          <div className="hero-copy">
            <span className="eyebrow light-eyebrow">UNIVERSO VESTIGIOS · VOL. 01</span>
            <h1>Viste historias.<br /><em>Deja huella.</em></h1>
            <p>Diseño independiente para quienes nunca fueron hechos en serie.</p>
            <a className="button button-light" href="#coleccion">Descubre la colección <Icon name="arrow" size={17} /></a>
          </div>
          <div className="hero-note"><span className="note-line" />Diseñado con intención<br />en Colombia</div>
          <div className="hero-pagination"><span className="active">01</span><i />03</div>
        </section>

        <section className="intro-strip">
          <span className="intro-mark">✳</span>
          <p>Creemos en las cosas que <em>cuentan algo.</em> En las manos detrás de cada pieza. En vestir como una forma de decir quién eres.</p>
          <span className="intro-location"><Icon name="pin" size={15} /> Hecho cerca, para llevar lejos</span>
        </section>

        <section className="section category-section" id="categorias">
          <div className="section-heading">
            <div><span className="eyebrow">ENCUENTRA TU PRÓXIMA HISTORIA</span><h2>Explora por <em>universo</em></h2></div>
            <a className="text-link" href="#coleccion">Ver todo <Icon name="arrow" size={16} /></a>
          </div>
          <div className="category-grid">
            {categories.map((category, index) => <button className={`category-card category-${index + 1}`} key={category.name} onClick={() => document.querySelector(category.href)?.scrollIntoView({ behavior: 'smooth' })}>
              <Photo id={category.image} src={category.src} alt={`Moda independiente: ${category.name}`} />
              <span className="category-overlay" />
              <span className="category-copy"><small>{category.count}</small><strong>{category.name}</strong></span>
              <span className="category-arrow"><Icon name="arrow" size={18} /></span>
            </button>)}
          </div>
        </section>

        <section className="section collection-section" id="coleccion">
          <div className="section-heading collection-heading">
            <div><span className="eyebrow">PIEZAS CON ALGO QUE DECIR</span><h2>Lo nuevo, lo <em>único</em></h2></div>
          <div className="collection-controls">
              <div className="filter-tabs" role="tablist" aria-label="Filtrar por categoría">{['Todo', 'Diseño de autor'].map((category) => <button key={category} className={activeCategory === category ? 'selected' : ''} onClick={() => setActiveCategory(category)}>{category}</button>)}</div>
              <button className="icon-button grid-search" aria-label="Buscar productos" onClick={() => setSearchOpen(true)}><Icon name="search" size={18} /></button>
            </div>
          </div>
          {searchQuery && <p className="search-result">Resultados para “{searchQuery}” <button onClick={() => setSearchQuery('')}>Limpiar</button></p>}
          <div className="product-grid">
            {filteredProducts.map(renderProductCard)}
            {filteredProducts.length === 0 && <div className="empty-state"><span>✳</span><h3>Todavía no encontramos esa historia.</h3><p>Prueba con otro nombre o explora todas nuestras piezas.</p><button className="text-link" onClick={() => { setSearchQuery(''); setActiveCategory('Todo') }}>Ver toda la colección <Icon name="arrow" size={16} /></button></div>}
          </div>
          <div className="collection-more"><a className="button button-outline" href="#coleccion-vestidos">Descubrir vestidos <Icon name="arrow" size={16} /></a><span>{filteredProducts.length} piezas seleccionadas</span></div>
        </section>

        <section className="section collection-section dress-collection" id="coleccion-vestidos">
          <div className="section-heading collection-heading">
            <div><span className="eyebrow">COLECCIÓN EXCLUSIVA · DISEÑO DE AUTOR</span><h2>Vestidos con <em>historia</em></h2></div>
            <span className="dress-count">{filteredDresses.length} vestidos</span>
          </div>
          <p className="collection-intro">Piezas de la colección de vestidos, diseñadas por {designerName}.</p>
          <div className="product-grid">
            {filteredDresses.map(renderProductCard)}
            {filteredDresses.length === 0 && <div className="empty-state"><span>✳</span><h3>No encontramos vestidos para esa búsqueda.</h3><p>Prueba con otro término o explora la colección completa.</p><button className="text-link" onClick={() => setSearchQuery('')}>Ver todos los vestidos <Icon name="arrow" size={16} /></button></div>}
          </div>
        </section>

        <section className="designer-feature" id="disenadores">
          <div className="designer-image"><Photo id="photo-1529139574466-a303027c1d8b" alt="Diseñadora colombiana en su estudio creativo" /></div>
          <div className="designer-copy"><span className="eyebrow">MÁS QUE UNA ETIQUETA</span><h2>Detrás de cada pieza,<br />hay una <em>persona.</em></h2><p>Personas que imaginan, prueban, descosen y vuelven a empezar. Conoce las historias y los talleres que le dan sentido a lo que llevas puesto.</p><div className="designer-actions"><button className="button button-dark" onClick={() => openDesignerPortal('register')}>Registrarse como diseñador <Icon name="arrow" size={16} /></button><button className="designer-login-link" onClick={() => openDesignerPortal(activeDesigner ? 'dashboard' : 'login')}>Ya tengo cuenta</button></div><div className="designer-signature"><span>Hecho por manos inquietas</span><i>V.</i></div></div>
        </section>

        <section className="manifesto" id="historia">
          <span className="eyebrow">UNA FORMA DISTINTA DE VESTIR</span>
          <h2>No sigas la tendencia.<br /><em>Encuentra lo que te encuentra.</em></h2>
          <p>VESTIGIOS conecta diseño independiente con personas que buscan vestir con intención. Cada hallazgo apoya una idea, un oficio y una forma más consciente de crear.</p>
          <a className="text-link" href="#coleccion">Nuestra manera de hacer <Icon name="arrow" size={16} /></a>
          <span className="manifesto-star">✳</span>
        </section>

        <section className="values-row">
          <article><span className="value-icon"><Icon name="leaf" size={20} /></span><div><h3>Menos, pero mejor</h3><p>Diseños pensados para durar. Producción bajo pedido cuando es posible.</p></div></article>
          <article><span className="value-icon">✳</span><div><h3>Creado aquí, con orgullo</h3><p>Talento independiente de Colombia, con identidad propia y manos reales.</p></div></article>
          <article><span className="value-icon"><Icon name="heart" size={20} /></span><div><h3>Una compra con sentido</h3><p>Cada elección impulsa nuevas voces y una industria más diversa.</p></div></article>
        </section>

        <section className="newsletter">
          <div><span className="eyebrow">CARTAS DESDE EL UNIVERSO VESTIGIOS</span><h2>Buenas historias<br /><em>merecen compartirse.</em></h2><p>Novedades, nuevos talentos y piezas que no aparecen dos veces. Sin ruido, solo lo que vale la pena.</p></div>
          <form onSubmit={(event) => { event.preventDefault(); setNotice('¡Listo! Te escribiremos con buenas historias.'); event.currentTarget.reset(); window.setTimeout(() => setNotice(''), 3000) }}><label htmlFor="email">Tu correo electrónico</label><div className="email-field"><input id="email" type="email" placeholder="hola@tucorreo.com" required /><button type="submit" aria-label="Suscribirme"><Icon name="arrow" /></button></div><small>Al suscribirte aceptas recibir novedades de VESTIGIOS.</small></form>
        </section>
      </main>

      {designerPortalOpen && <div className="cart-backdrop designer-portal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setDesignerPortalOpen(false) }}>
        <section className="designer-portal" role="dialog" aria-modal="true" aria-labelledby="designer-portal-title">
          <div className="designer-portal-header">
            <div><span className="eyebrow">ESPACIO DE DISEÑADORES</span><h2 id="designer-portal-title">{designerView === 'dashboard' ? `Hola, ${activeDesigner?.name.split(' ')[0]}` : designerView === 'register' ? 'Tu historia también merece un espacio.' : 'Entra a tu estudio.'}</h2></div>
            <button className="icon-button" aria-label="Cerrar" onClick={() => setDesignerPortalOpen(false)}><Icon name="close" /></button>
          </div>

          {designerView === 'dashboard' && activeDesigner ? <div className="designer-dashboard">
            <div className="designer-profile-summary"><div className="designer-avatar">{activeDesigner.name.charAt(0)}</div><div><span className="eyebrow">{activeDesigner.brand}</span><h3>{activeDesigner.name}</h3><p>{activeDesigner.municipality}, {activeDesigner.country} · {activeDesigner.email} · {activeDesigner.phone}</p></div><button className="designer-logout" onClick={() => { setActiveDesigner(null); setDesignerView('login') }}>Cerrar sesión</button></div>
            <div className="designer-dashboard-heading"><div><span className="eyebrow">TU ESPACIO</span><h3>Mi colección <span>{activeDesigner.collection.length}</span></h3></div><p>Esta es la colección asociada a tu cuenta de diseñadora.</p></div>
            {activeDesigner.collection.length > 0 ? <div className="designer-collection-grid">{activeDesigner.collection.map((product) => <article className="designer-piece" key={product.id}><img src={product.image} alt={product.name} /><div><span>{product.category}</span><h4>{product.name}</h4></div></article>)}</div> : <div className="designer-empty-collection"><span>✳</span><h3>Tu colección está lista para comenzar.</h3><p>Las piezas que agregues a tu cuenta aparecerán aquí. Por ahora, este espacio funciona como una demostración visual.</p></div>}
          </div> : designerView === 'register' ? <form className="designer-form" onSubmit={registerDesigner}>
            <p className="designer-country-notice"><strong>Disponibilidad actual: Colombia.</strong> Por ahora recibimos registros únicamente de diseñadores que estén en Colombia.</p>
            <div className="designer-form-grid">
              <label>Nombre completo<input name="name" autoComplete="name" placeholder="Tu nombre" required /></label>
              <label>Nombre de marca o taller<input name="brand" placeholder="Tu marca" required /></label>
              <label>País<select name="country" value="Colombia" disabled><option>Colombia</option></select></label>
              <label>Municipio<input name="municipality" placeholder="Ej. Bogotá" autoComplete="address-level2" required /></label>
              <label>Correo electrónico<input name="email" type="email" autoComplete="email" placeholder="tu@correo.com" required /></label>
              <label>Celular<input name="phone" type="tel" autoComplete="tel" placeholder="+57 300 000 0000" required /></label>
              <label className="designer-password-field">Contraseña<input name="password" type="password" autoComplete="new-password" minLength="8" placeholder="Mínimo 8 caracteres" required /></label>
            </div>
            {designerError && <p className="designer-form-error" role="alert">{designerError}</p>}
            <button className="button button-dark designer-submit" type="submit">Crear cuenta de diseñadora <Icon name="arrow" size={16} /></button>
            <p className="designer-form-switch">¿Ya tienes cuenta? <button type="button" onClick={() => { setDesignerError(''); setDesignerView('login') }}>Inicia sesión</button></p>
          </form> : <div className="designer-auth-grid">
            <form className="designer-form designer-login-form" onSubmit={loginDesigner}>
              <p>Inicia sesión para ver la colección asociada a tu cuenta.</p>
              <label>Correo electrónico<input name="email" type="email" autoComplete="username" placeholder="tu@correo.com" required /></label>
              <label>Contraseña<input name="password" type="password" autoComplete="current-password" placeholder="Tu contraseña" required /></label>
              {designerError && <p className="designer-form-error" role="alert">{designerError}</p>}
              <button className="button button-dark designer-submit" type="submit">Ingresar a mi colección <Icon name="arrow" size={16} /></button>
              <p className="designer-form-switch">¿Aún no tienes cuenta? <button type="button" onClick={() => { setDesignerError(''); setDesignerView('register') }}>Regístrate como diseñador</button></p>
            </form>
            <aside className="designer-demo-account"><span className="eyebrow">CUENTA DE DEMOSTRACIÓN</span><h3>Prueba el espacio de diseñadora</h3><p>Entra con esta cuenta hardcodeada para ver una colección de ejemplo.</p><dl><div><dt>Correo</dt><dd>disenadora@vestigios.co</dd></div><div><dt>Contraseña</dt><dd>Vestigios2025!</dd></div></dl><button className="button button-outline" onClick={() => { setActiveDesigner(demoDesignerAccount); setDesignerError(''); setDesignerView('dashboard') }}>Entrar a la cuenta demo <Icon name="arrow" size={16} /></button></aside>
          </div>}
        </section>
      </div>}

      {cartOpen && <div className="cart-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false) }}>
        <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
          <div className="cart-header"><div><span className="eyebrow">TU SELECCIÓN</span><h2 id="cart-title">Tu bolsa <span>({cartCount})</span></h2></div><button className="icon-button" aria-label="Cerrar bolsa" onClick={() => setCartOpen(false)}><Icon name="close" /></button></div>
          {cartItems.length === 0 ? <div className="cart-empty"><span>✳</span><h3>Tu bolsa está esperando.</h3><p>Cuando encuentres una pieza que te represente, la guardaremos aquí.</p><button className="button button-dark" onClick={() => setCartOpen(false)}>Seguir explorando</button></div> : <>
            <div className="cart-items">{cartItems.map(({ product, quantity }) => <article className="cart-item" key={product.id}>
              <img src={product.image} alt={`${product.name}. ${product.description}`} />
              <div className="cart-item-details"><span className="designer-name">{product.designer}</span><h3>{product.name}</h3><p>Precio por confirmar</p>
                <div className="cart-item-actions"><div className="quantity-control" aria-label={`Cantidad de ${product.name}`}><button aria-label="Disminuir cantidad" onClick={() => changeQuantity(product.id, -1)}>−</button><span>{quantity}</span><button aria-label="Aumentar cantidad" onClick={() => changeQuantity(product.id, 1)}>+</button></div><button className="remove-item" onClick={() => removeFromCart(product.id)}>Eliminar</button></div>
              </div>
              <button className="remove-item-icon" aria-label={`Eliminar ${product.name}`} onClick={() => removeFromCart(product.id)}><Icon name="close" size={16} /></button>
            </article>)}</div>
            <div className="cart-footer"><div className="cart-total"><span>{cartCount} {cartCount === 1 ? 'pieza seleccionada' : 'piezas seleccionadas'}</span><span>Precio por confirmar</span></div><p>Te ayudaremos a confirmar disponibilidad, precio y envío antes de finalizar.</p><a className="button button-dark cart-cta" href={`mailto:yilian.perez@cun.edu.co?subject=${encodeURIComponent('Consulta sobre mi selección VESTIGIOS')}&body=${encodeURIComponent(cartItems.map(({ product, quantity }) => `${product.name} — cantidad: ${quantity}`).join('\n'))}`}>Consultar mi selección <Icon name="arrow" size={16} /></a></div>
          </>}
        </aside>
      </div>}

      <footer className="site-footer" id="creadores"><div className="footer-main"><div className="footer-brand"><a className="wordmark footer-wordmark" href="#inicio">VESTIGIOS<span>®</span><small>MODA CON HISTORIA</small></a><p>Descubre lo que te hace diferente.</p><a className="social-link" href="https://instagram.com" aria-label="Instagram"><Icon name="instagram" size={18} /></a></div><div className="footer-column"><strong>Explora</strong><a href="#coleccion">Novedades</a><a href="#categorias">Ropa</a><a href="#categorias">Accesorios</a><a href="#categorias">Joyería</a></div><div className="footer-column"><strong>VESTIGIOS</strong><a href="#historia">Nuestra historia</a><a href="#disenadores">Vende con nosotros</a><a href="#historia">Diseño responsable</a><a href="#historia">Preguntas frecuentes</a></div><div className="footer-column"><strong>¿Hablamos?</strong><a href="mailto:hola@vestigios.co">hola@vestigios.co</a><span>Bogotá, Colombia</span><span>Lunes a viernes · 9 a 5</span></div></div><div className="footer-bottom"><span>© 2025 VESTIGIOS. Hecho con intención en Colombia.</span><div><a href="#historia">Privacidad</a><a href="#historia">Términos</a></div><span>ES · COP $</span></div></footer>
      {notice && <div className="toast" role="status"><span>✳</span>{notice}</div>}
    </>
  )
}

export default App
