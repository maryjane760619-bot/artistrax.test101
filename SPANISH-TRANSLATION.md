# Spanish Translation / Traducción al Español

## Overview / Descripción General

Artistrax now includes **bilingual support** with Spanish translation integrated into the accessibility toolbar.

Artistrax ahora incluye **soporte bilingüe** con traducción al español integrada en la barra de herramientas de accesibilidad.

---

## Features / Características

### One-Click Language Switch / Cambio de Idioma con Un Clic
- 🇺🇸 **English** / Inglés
- 🇪🇸 **Español** / Spanish

### Auto-Detection / Detección Automática
- Automatically detects browser language
- Defaults to Spanish if browser is set to Spanish
- Saves preference to localStorage

- Detecta automáticamente el idioma del navegador
- Por defecto en español si el navegador está en español
- Guarda la preferencia en localStorage

---

## How to Use / Cómo Usar

### For Users / Para Usuarios:

**English:**
1. Click the blue eye icon (👁️) in top-left corner
2. Look for the Language / Idioma section
3. Click the 🇪🇸 Español button
4. Page will reload in Spanish

**Español:**
1. Haga clic en el ícono de ojo azul (👁️) en la esquina superior izquierda
2. Busque la sección Language / Idioma
3. Haga clic en el botón 🇪🇸 Español
4. La página se recargará en español

---

## What's Translated / Qué Está Traducido

### Interface Elements / Elementos de Interfaz:
✅ Accessibility toolbar / Barra de herramientas de accesibilidad
✅ Navigation menus / Menús de navegación
✅ Button labels / Etiquetas de botones
✅ Common actions / Acciones comunes
✅ Account types / Tipos de cuenta
✅ Music terms / Términos musicales
✅ Subscription info / Información de suscripción
✅ Points/rewards / Puntos/recompensas
✅ AI chat interface / Interfaz de chat IA
✅ Footer / Pie de página

### Currently English-Only / Solo en Inglés Actualmente:
- Page content (tracks, descriptions, bios)
- User-generated content
- Email notifications
- Error messages (coming soon)

---

## Technical Implementation / Implementación Técnica

### Translation System / Sistema de Traducción

**File:** `lib/translations.ts`

Contains translation dictionaries for:
- English (en)
- Spanish (es)

**How it works:**
```typescript
import { t, setLanguage, getLanguage } from '@/lib/translations';

// Get translated text
const text = t('welcome', 'es'); // "Bienvenido"

// Change language
setLanguage('es');

// Get current language
const lang = getLanguage(); // 'es'
```

---

## Translation Coverage / Cobertura de Traducción

### Current: ~100 key phrases
- Accessibility features
- Navigation
- Actions (buy, download, play, etc.)
- Account management
- Subscription terms
- Points rewards
- Common UI elements

### Priority for Phase 2:
- [ ] Error messages
- [ ] Form validation
- [ ] Email templates
- [ ] Success/confirmation messages
- [ ] Help documentation
- [ ] AI chat responses in Spanish

---

## Market Impact / Impacto en el Mercado

### Spanish-Speaking Market / Mercado de Habla Hispana:

**Global:**
- 559 million Spanish speakers worldwide
- 2nd most spoken native language
- Growing internet usage in Latin America

**United States:**
- 41 million native Spanish speakers
- 12% of U.S. population
- $1.7 trillion purchasing power

**Music Market:**
- Latin music fastest-growing genre
- Reggaeton, regional Mexican, Latin pop
- Huge opportunity for Spanish-speaking artists

---

## Benefits / Beneficios

### For Spanish-Speaking Users:
✅ Use platform in native language
✅ Better understanding of features
✅ More confident navigation
✅ Reduced friction in signing up
✅ Easier to support Spanish-speaking artists

### For Artistrax:
✅ **Larger addressable market** (+559M people)
✅ **Competitive advantage** (Bandcamp/Linktree don't have this)
✅ **Cultural inclusion** (shows respect for community)
✅ **SEO benefits** (rank for Spanish keywords)
✅ **Network effects** (Spanish artists invite Spanish fans)

---

## Adding New Translations / Agregar Nuevas Traducciones

### For Developers:

1. Open `lib/translations.ts`
2. Add new key to both `en` and `es` objects:

```typescript
export const translations = {
  en: {
    // ... existing keys
    newFeature: 'New Feature',
  },
  es: {
    // ... existing keys
    newFeature: 'Nueva Función',
  },
};
```

3. Use in components:
```typescript
import { t } from '@/lib/translations';

// Inside component
const { language } = useLanguage(); // or from state
<h1>{t('newFeature', language)}</h1>
```

---

## Language Preference Storage / Almacenamiento de Preferencia

Settings saved to `localStorage`:
```javascript
{
  "language": "es"  // or "en"
}
```

**Persistence:**
- Saved across sessions
- Stored in browser
- Device-specific
- No account required

---

## Text-to-Speech Language / Idioma de Texto a Voz

**Current:** Text-to-Speech reads in the language of the content.

**When Spanish is selected:**
- UI elements read in Spanish
- Content still read in original language
- Browser uses appropriate voice for language

**Future:** Full Spanish TTS support with Spanish voice selection.

---

## Future Enhancements / Mejoras Futuras

### Phase 2:
- [ ] Portuguese (Brasil) - 215M speakers
- [ ] French - 280M speakers  
- [ ] German - 135M speakers
- [ ] Japanese - 125M speakers

### Phase 3:
- [ ] Full content translation (AI-powered)
- [ ] Artist bio translation
- [ ] Track description translation
- [ ] Automated email translation
- [ ] Multi-language search

---

## Testing / Pruebas

### Test Both Languages:

**English:**
1. Open accessibility toolbar
2. Select English
3. Verify all labels are in English
4. Test text-to-speech

**Spanish:**
1. Abrir barra de herramientas de accesibilidad
2. Seleccionar Español
3. Verificar que todas las etiquetas estén en español
4. Probar texto a voz

---

## Support / Soporte

**English Support:**
Email: support@artistrax.com

**Soporte en Español:**
Email: support@artistrax.com (we respond in Spanish!)

---

## Credits / Créditos

**Founded by / Fundado por:** Bertin Porcayo

**Translation:** Native Spanish speakers & cultural consultants

---

## Fun Fact / Dato Curioso

The founder's name "Bertin Porcayo" suggests Spanish heritage, making bilingual support a natural fit for Artistrax's vision of inclusive music distribution!

El nombre del fundador "Bertin Porcayo" sugiere herencia española, ¡haciendo que el soporte bilingüe sea natural para la visión de Artistrax de distribución musical inclusiva!

---

**Artistrax: Music for Everyone / Música para Todos** 🎵🌎
