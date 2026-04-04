// docs/js/api.js — Neon Auth + Data API module
// No backend server needed. All calls go directly to Neon.

const AUTH_URL = 'https://ep-wild-heart-al3orr3h.neonauth.c-3.eu-central-1.aws.neon.tech/neondb/auth';
const DATA_URL = 'https://ep-wild-heart-al3orr3h.apirest.c-3.eu-central-1.aws.neon.tech/neondb/rest/v1';

const API = (() => {
  const CONFIG = { jwt: null, timeout: 10000 };

  async function request(method, url, body) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONFIG.timeout);
    try {
      const opts = {
        method,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        signal: controller.signal
      };
      if (CONFIG.jwt) opts.headers['Authorization'] = 'Bearer ' + CONFIG.jwt;
      if (body) opts.body = JSON.stringify(body);
      const res = await fetch(url, opts);
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error((data && (data.message || data.error || data.hint)) || res.statusText);
      return data;
    } catch (e) {
      if (e.name === 'AbortError') throw new Error('Request timed out');
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }

  async function authRequest(method, path, body) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(AUTH_URL + path, opts);
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error((data && (data.message || data.error)) || res.statusText);
    return data;
  }

  return {
    // Auth
    signUp: (email, password, name) => authRequest('POST', '/sign-up/email', {
      email, password, name: name || email.split('@')[0]
    }),

    signIn: (email, password) => authRequest('POST', '/sign-in/email', { email, password }),

    getSession: async () => {
      const res = await fetch(AUTH_URL + '/get-session', { credentials: 'include' });
      const jwt = res.headers.get('set-auth-jwt');
      if (jwt) CONFIG.jwt = jwt;
      return jwt;
    },

    signOut: async () => {
      await fetch(AUTH_URL + '/sign-out', { method: 'POST', credentials: 'include' }).catch(() => {});
      CONFIG.jwt = null;
    },

    hasJWT: () => !!CONFIG.jwt,

    // Data
    getQuestions: () => request('GET', DATA_URL + '/questions?order=order.asc'),

    submitReflection: (payload) => request('POST', DATA_URL + '/rpc/submit_reflection', {
      p_name: payload.name,
      p_country_code: payload.country_code,
      p_country_name: payload.country_name,
      p_submitted_at: payload.submitted_at,
      p_answers: payload.answers
    }),

    getResponses: () => request('GET', DATA_URL + '/responses?order=created_at.desc'),

    getResponsesWithAnswers: async () => {
      const [responses, answers, questions] = await Promise.all([
        request('GET', DATA_URL + '/responses?order=created_at.desc'),
        request('GET', DATA_URL + '/answers'),
        request('GET', DATA_URL + '/questions?order=order.asc')
      ]);
      const qMap = {};
      questions.forEach(q => { qMap[q.id] = q.text; });
      const aMap = {};
      answers.forEach(a => {
        if (!aMap[a.response_id]) aMap[a.response_id] = [];
        aMap[a.response_id].push({ question: qMap[a.question_id] || '', answer: a.answer_text });
      });
      return responses.map(r => ({ ...r, answers: aMap[r.id] || [] }));
    },

    deleteResponse: (id) => request('DELETE', DATA_URL + '/responses?id=eq.' + id)
  };
})();
