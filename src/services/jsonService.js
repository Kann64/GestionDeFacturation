import axios from 'axios'

const BASE = import.meta.env.VITE_JSON_SERVER_URL || 'http://localhost:4000'

const http = axios.create({ baseURL: BASE })

export const jsonService = {
  // ───────────── Articles ─────────────
  async getArticles() {
    const { data } = await http.get('/articles')
    return data
  },
  async addArticle(article) {
    const { data } = await http.post('/articles', article)
    return data
  },
  async updateArticle(id, article) {
    const { data } = await http.put(`/articles/${id}`, article)
    return data
  },
  async deleteArticle(id) {
    await http.delete(`/articles/${id}`)
  },

  // ───────────── Catégories ─────────────
  async getCategories() {
    const { data } = await http.get('/categories')
    return data
  },
  async addCategorie(categorie) {
    const { data } = await http.post('/categories', categorie)
    return data
  },
  async updateCategorie(id, categorie) {
    const { data } = await http.put(`/categories/${id}`, categorie)
    return data
  },
  async deleteCategorie(id) {
    await http.delete(`/categories/${id}`)
  },

  // ───────────── Paramètres globaux ─────────────
  async getParametres() {
    const { data } = await http.get('/parametres')
    return data
  },
  async updateParametres(parametres) {
    const { data } = await http.put('/parametres', parametres)
    return data
  },
}

export default jsonService
