import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

type Lang = 'en' | 'fr'

type TranslationValue = string | Record<string, TranslationValue> | Array<any>

type LanguageContextValue = {
  lang: Lang
  t: (key: string) => string
  get: (key: string) => TranslationValue | undefined
  setLang: (lang: Lang) => void
  toggleLang: () => void
}

const STORAGE_KEY = 'site-language'

const translations: Record<Lang, TranslationValue> = {
  en: {
    meta: {
      title: 'MacDonald AI',
      description: 'I turn your computer into a 20-person workforce. Automation is your unfair advantage.',
    },
    nav: {
      home: 'Home',
      about: 'About',
      services: 'Services',
    },
    header: {
      bookCall: 'Book a Call',
      getQuote: 'Get a Quote',
      menu: 'Menu',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      book: 'Book',
    },
    language: {
      toggleToFrench: 'Switch to French',
      toggleToEnglish: 'Switch to English',
    },
    hero: {
      title: 'We turn your computer into a 20-person workforce.',
      subtitle:
        'Building powerful automation that does the boring work for you: data entry, client follow-ups, reports, websites, and more - while you focus on the stuff that actually makes money.',
    },
    home: {
      sectionTitle: 'What I Build',
      sectionBody:
        'Custom software - from AI agents and automation systems to full websites, web apps, and desktop apps. Every project is designed to save time, scale your business, and create an unfair advantage.',
    },
    about: {
      title: 'About',
      photoAlt: 'Joseph MacDonald',
      photoFallback: 'Put your photo at public/me.jpeg (or me.jpg)',
      p1:
        "I'm Joseph MacDonald, a developer, builder, and entrepreneur from Ottawa. I run MacDonald AI, where we use AI and/or software to create systems that make (or save) real money: automation for ops, custom software, integrations, data pipelines, and agents where they actually help. We don't just add a chatbot to your site-we build the underlying workflows and tools that move the business.",
      p2:
        'Big company or small team, the goal is the same: design and ship reliable automation that saves time, boosts performance, and pays for itself fast.',
    },
    services: {
      title: 'Services',
      intro:
        'Straightforward, high-impact deliverables. Built to be reliable, fast, and easy to use.',
      items: [
        { title: 'AI Agents', desc: 'Task-specific agents that operate across apps and data.' },
        { title: 'Workflow Automation', desc: 'Browser automation, APIs, and schedulers that save hours.' },
        { title: 'Integrations', desc: 'APIs, CRMs, databases, webhooks, spreadsheets - wired cleanly.' },
        { title: 'Dashboards & Reporting', desc: 'Clear, actionable views of performance with automated updates.' },
        { title: 'Websites & Web Apps', desc: 'Modern, fast, and maintainable frontends with clean backends.' },
      ],
    },
    quote: {
      title: 'Get a Quote',
      intro: 'Tell me what you want to build or automate.',
      labels: {
        name: 'Name',
        email: 'Email',
        message: 'Message',
      },
      placeholders: {
        name: 'Your name',
        email: 'you@example.com',
        message: 'What do you want to build or automate?',
      },
      submit: 'Submit',
      sending: 'Sending...',
      success: "Thanks - I received your request. I'll reply shortly.",
      error: 'We could not send your request right now. Please try again shortly.',
      preferEmail: 'Prefer email?',
    },
    cta: {
      bookCall: 'Book a Call',
      aiChatbot: 'AI Chatbot',
      ask: 'Ask MacDonald AI',
    },
    chat: {
      assistant: 'Assistant',
      close: 'Close',
      empty: 'How can I help today?',
      typing: 'Assistant is typing',
      messageLabel: 'Message MacDonald AI Assistant',
      placeholder: 'Ask your question',
      send: 'Send',
      sending: 'Sending...',
      error: 'Sorry, something went wrong. Please try again in a moment.',
    },
    footer: {
      rights: 'All rights reserved.',
    },
  },
  fr: {
    meta: {
      title: 'MacDonald AI',
      description: "Je transforme votre ordinateur en équipe de 20 personnes. L'automatisation est votre avantage injuste.",
    },
    nav: {
      home: 'Accueil',
      about: 'À propos',
      services: 'Services',
    },
    header: {
      bookCall: 'Réserver un appel',
      getQuote: 'Demander un devis',
      menu: 'Menu',
      openMenu: 'Ouvrir le menu',
      closeMenu: 'Fermer le menu',
      book: 'Réserver',
    },
    language: {
      toggleToFrench: 'Passer en français',
      toggleToEnglish: "Passer à l'anglais",
    },
    hero: {
      title: 'On transforme votre ordinateur en équipe de 20 personnes.',
      subtitle:
        "On construit une automatisation puissante qui fait les tâches plates : saisie de données, suivis clients, rapports, sites web, et plus - pendant que vous vous concentrez sur ce qui rapporte vraiment.",
    },
    home: {
      sectionTitle: 'Ce que je construis',
      sectionBody:
        "Logiciels sur mesure - des agents IA et systèmes d'automatisation jusqu'aux sites web, applis web et applis de bureau. Chaque projet est conçu pour gagner du temps, faire grandir votre entreprise et créer un avantage concurrentiel.",
    },
    about: {
      title: 'À propos',
      photoAlt: 'Joseph MacDonald',
      photoFallback: 'Mettez votre photo dans public/me.jpeg (ou me.jpg)',
      p1:
        "Je m'appelle Joseph MacDonald, développeur, expert d'automisation et entrepreneur basé à Ottawa. Je dirige MacDonald AI, où nous utilisons l'IA et/ou le logiciel pour créer des systèmes qui font (ou économisent) de l'argent : automatisation des opérations, logiciels sur mesure, intégrations, pipelines de données et agents là où ils aident vraiment. On ne fait pas juste ajouter un chatbot à votre site - on construit les workflows et les outils qui font avancer l'entreprise.",
      p2:
        "Grande entreprise ou petite équipe, l'objectif est le même : concevoir et livrer une automatisation fiable qui fait gagner du temps, booste la performance et se rentabilise rapidement.",
    },
    services: {
      title: 'Services',
      intro:
        'Livrables simples et à fort impact. Bâtis pour être fiables, rapides et faciles à utiliser.',
      items: [
        { title: 'Agents IA', desc: 'Agents spécialisés qui opèrent entre les applis et les données.' },
        { title: 'Automatisation des workflows', desc: 'Automatisation navigateur, APIs et planificateurs qui économisent des heures.' },
        { title: 'Intégrations', desc: 'APIs, CRM, bases de données, webhooks, feuilles de calcul - connectés proprement.' },
        { title: 'Tableaux de bord et rapports', desc: 'Vues claires et actionnables de la performance, mises à jour automatiquement.' },
        { title: 'Sites web et applis web', desc: 'Frontends modernes, rapides et faciles à maintenir avec des backends propres.' },
      ],
    },
    quote: {
      title: 'Demander un devis',
      intro: 'Dites-moi ce que vous voulez construire ou automatiser.',
      labels: {
        name: 'Nom',
        email: 'Courriel',
        message: 'Message',
      },
      placeholders: {
        name: 'Votre nom',
        email: 'vous@exemple.com',
        message: 'Que voulez-vous construire ou automatiser?',
      },
      submit: 'Envoyer',
      sending: 'Envoi...',
      success: "Merci - j'ai bien reçu votre demande. Je vous réponds sous peu.",
      error: "Impossible d'envoyer votre demande pour l'instant. Veuillez réessayer bientôt.",
      preferEmail: 'Vous préférez le courriel?',
    },
    cta: {
      bookCall: 'Réserver un appel',
      aiChatbot: 'Chat IA',
      ask: 'Demander à MacDonald AI',
    },
    chat: {
      assistant: 'Assistant',
      close: 'Fermer',
      empty: "Comment puis-je aider aujourd'hui?",
      typing: "L'assistant écrit",
      messageLabel: "Message à l'assistant MacDonald AI",
      placeholder: 'Posez votre question',
      send: 'Envoyer',
      sending: 'Envoi...',
      error: "Désolé, un problème est survenu. Veuillez réessayer dans un moment.",
    },
    footer: {
      rights: 'Tous droits réservés.',
    },
  },
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function getByPath(obj: TranslationValue, path: string) {
  return path.split('.').reduce<TranslationValue | undefined>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, TranslationValue>)[key]
    }
    return undefined
  }, obj)
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'en'
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved === 'fr' ? 'fr' : 'en'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang === 'fr' ? 'fr-CA' : 'en'
    const metaTitle = getByPath(translations[lang], 'meta.title')
    const metaDesc = getByPath(translations[lang], 'meta.description')
    if (typeof metaTitle === 'string') document.title = metaTitle
    if (typeof metaDesc === 'string') {
      const descTag = document.querySelector('meta[name="description"]')
      if (descTag) descTag.setAttribute('content', metaDesc)
    }
  }, [lang])

  const value = useMemo<LanguageContextValue>(() => {
    const t = (key: string) => {
      const result = getByPath(translations[lang], key)
      return typeof result === 'string' ? result : key
    }
    const get = (key: string) => getByPath(translations[lang], key)
    const toggleLang = () => setLang((current) => (current === 'en' ? 'fr' : 'en'))
    return { lang, t, get, setLang, toggleLang }
  }, [lang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return ctx
}
