// Words that are NEVER useful as game hints.
// Covers: function words, all forms of the 20 most common Spanish verbs,
// and ultra-generic adjectives/nouns that carry no informational value.
export const STOPWORDS = new Set([

  // ── ARTICLES ─────────────────────────────────────────────────────────────
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'del',

  // ── PERSONAL & OBJECT PRONOUNS ───────────────────────────────────────────
  'yo', 'tu', 'tú', 'él', 'ella', 'ello',
  'nosotros', 'nosotras', 'vosotros', 'vosotras',
  'ellos', 'ellas', 'usted', 'ustedes', 'vos',
  'me', 'te', 'le', 'les', 'nos', 'os', 'lo', 'se',

  // ── DEMONSTRATIVES ───────────────────────────────────────────────────────
  'este', 'esta', 'estos', 'estas', 'esto',
  'ese', 'esa', 'esos', 'esas', 'eso',
  'aquel', 'aquella', 'aquellos', 'aquellas', 'aquello',

  // ── POSSESSIVES ──────────────────────────────────────────────────────────
  'mío', 'mía', 'míos', 'mías',
  'tuyo', 'tuya', 'tuyos', 'tuyas',
  'suyo', 'suya', 'suyos', 'suyas',

  // ── INDEFINITE DETERMINERS ───────────────────────────────────────────────
  'algún', 'alguno', 'alguna', 'algunos', 'algunas',
  'ningún', 'ninguno', 'ninguna', 'ningunos', 'ningunas',
  'cualquier', 'cualquiera', 'cualesquiera',
  'ambos', 'ambas', 'demás',
  'mismo', 'misma', 'mismos', 'mismas',
  'propio', 'propia', 'propios', 'propias',

  // ── CONJUNCTIONS ─────────────────────────────────────────────────────────
  'que', 'y', 'e', 'o', 'u', 'ni',
  'pero', 'sino', 'aunque', 'porque', 'pues',
  'cuando', 'donde', 'mientras', 'si', 'como', 'conforme', 'según',

  // ── RELATIVE/INTERROGATIVE PRONOUNS ──────────────────────────────────────
  'quien', 'quién', 'quienes', 'quiénes',
  'cual', 'cuál', 'cuales', 'cuáles',

  // ── PREPOSITIONS (purely grammatical) ────────────────────────────────────
  'a', 'al', 'de', 'en', 'con', 'sin', 'por', 'para',
  'ante', 'tras', 'hacia', 'hasta', 'desde',
  'durante', 'mediante', 'entre', 'sobre', 'según', 'través',

  // ── ADVERBS (no standalone noun/adj meaning) ─────────────────────────────
  'muy', 'más', 'menos', 'tan', 'tanto', 'tanta', 'tantos', 'tantas',
  'también', 'tampoco', 'además', 'incluso',
  'ya', 'aún', 'todavía', 'siempre', 'nunca', 'jamás',
  'solo', 'solamente', 'apenas', 'casi',
  'quizás', 'quizá', 'acaso', 'tal',
  'así', 'entonces', 'luego', 'después', 'antes',
  'aquí', 'ahí', 'allí', 'allá', 'acá',
  'hoy', 'ayer', 'mañana',
  'bien', 'mal', 'medio',

  // ── SER ──────────────────────────────────────────────────────────────────
  'ser', 'sido', 'siendo',
  'soy', 'eres', 'es', 'somos', 'sois', 'son',
  'era', 'eras', 'éramos', 'erais', 'eran',
  'fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron',
  'seré', 'serás', 'será', 'seremos', 'seréis', 'serán',
  'sería', 'serías', 'seríamos', 'seríais', 'serían',

  // ── ESTAR ─────────────────────────────────────────────────────────────────
  'estar', 'estado', 'estando',
  'estoy', 'estás', 'está', 'estamos', 'estáis', 'están',
  'estaba', 'estabas', 'estábamos', 'estabais', 'estaban',
  'estuve', 'estuviste', 'estuvo', 'estuvimos', 'estuvisteis', 'estuvieron',
  'estaré', 'estarás', 'estará', 'estaremos', 'estaréis', 'estarán',
  'estaría', 'estarías', 'estaríamos', 'estaríais', 'estarían',

  // ── HABER ─────────────────────────────────────────────────────────────────
  'haber', 'habido', 'habiendo', 'hay',
  'he', 'has', 'ha', 'hemos', 'habéis', 'han',
  'había', 'habías', 'habíamos', 'habíais', 'habían',
  'hube', 'hubiste', 'hubo', 'hubimos', 'hubisteis', 'hubieron',
  'habré', 'habrás', 'habrá', 'habremos', 'habréis', 'habrán',
  'habría', 'habrías', 'habríamos', 'habríais', 'habrían',

  // ── TENER ─────────────────────────────────────────────────────────────────
  'tener', 'tenido', 'teniendo',
  'tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen',
  'tenía', 'tenías', 'teníamos', 'teníais', 'tenían',
  'tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvisteis', 'tuvieron',
  'tendré', 'tendrás', 'tendrá', 'tendremos', 'tendréis', 'tendrán',
  'tendría', 'tendrías', 'tendríamos', 'tendríais', 'tendrían',

  // ── IR ────────────────────────────────────────────────────────────────────
  'ir', 'ido', 'yendo',
  'voy', 'vas', 'va', 'vamos', 'vais', 'van',
  'iba', 'ibas', 'íbamos', 'ibais', 'iban',
  'iré', 'irás', 'irá', 'iremos', 'iréis', 'irán',
  'iría', 'irías', 'iríamos', 'iríais', 'irían',

  // ── VER ───────────────────────────────────────────────────────────────────
  'ver', 'visto', 'viendo',
  'veo', 'ves', 've', 'vemos', 'veis', 'ven',
  'veía', 'veías', 'veíamos', 'veíais', 'veían',
  'vi', 'viste', 'vio', 'vimos', 'visteis', 'vieron',
  'veré', 'verás', 'verá', 'veremos', 'veréis', 'verán',
  'vería', 'verías', 'veríamos', 'veríais', 'verían',

  // ── DAR ───────────────────────────────────────────────────────────────────
  'dar', 'dado', 'dando',
  'doy', 'das', 'da', 'damos', 'dais', 'dan',
  'daba', 'dabas', 'dábamos', 'dabais', 'daban',
  'di', 'diste', 'dio', 'dimos', 'disteis', 'dieron',
  'daré', 'darás', 'dará', 'daremos', 'daréis', 'darán',
  'daría', 'darías', 'daríamos', 'daríais', 'darían',

  // ── HACER ─────────────────────────────────────────────────────────────────
  'hacer', 'hecho', 'haciendo',
  'hago', 'haces', 'hace', 'hacemos', 'hacéis', 'hacen',
  'hacía', 'hacías', 'hacíamos', 'hacíais', 'hacían',
  'hice', 'hiciste', 'hizo', 'hicimos', 'hicisteis', 'hicieron',
  'haré', 'harás', 'hará', 'haremos', 'haréis', 'harán',
  'haría', 'harías', 'haríamos', 'haríais', 'harían',

  // ── DECIR ─────────────────────────────────────────────────────────────────
  'decir', 'dicho', 'diciendo',
  'digo', 'dices', 'dice', 'decimos', 'decís', 'dicen',
  'decía', 'decías', 'decíamos', 'decíais', 'decían',
  'dije', 'dijiste', 'dijo', 'dijimos', 'dijisteis', 'dijeron',
  'diré', 'dirás', 'dirá', 'diremos', 'diréis', 'dirán',
  'diría', 'dirías', 'diríamos', 'diríais', 'dirían',

  // ── PODER ─────────────────────────────────────────────────────────────────
  'poder', 'podido', 'pudiendo',
  'puedo', 'puedes', 'puede', 'podemos', 'podéis', 'pueden',
  'podía', 'podías', 'podíamos', 'podíais', 'podían',
  'pude', 'pudiste', 'pudo', 'pudimos', 'pudisteis', 'pudieron',
  'podré', 'podrás', 'podrá', 'podremos', 'podréis', 'podrán',
  'podría', 'podrías', 'podríamos', 'podríais', 'podrían',

  // ── QUERER ────────────────────────────────────────────────────────────────
  'querer', 'querido', 'queriendo',
  'quiero', 'quieres', 'quiere', 'queremos', 'queréis', 'quieren',
  'quería', 'querías', 'queríamos', 'queríais', 'querían',
  'quise', 'quisiste', 'quiso', 'quisimos', 'quisisteis', 'quisieron',
  'querré', 'querrás', 'querrá', 'querremos', 'querréis', 'querrán',
  'querría', 'querrías', 'querríamos', 'querríais', 'querrían',

  // ── SABER ─────────────────────────────────────────────────────────────────
  'saber', 'sabido', 'sabiendo',
  'sé', 'sabes', 'sabe', 'sabemos', 'sabéis', 'saben',
  'sabía', 'sabías', 'sabíamos', 'sabíais', 'sabían',
  'supe', 'supiste', 'supo', 'supimos', 'supisteis', 'supieron',
  'sabré', 'sabrás', 'sabrá', 'sabremos', 'sabréis', 'sabrán',
  'sabría', 'sabrías', 'sabríamos', 'sabríais', 'sabrían',

  // ── DEBER ─────────────────────────────────────────────────────────────────
  'deber', 'debido', 'debiendo',
  'debo', 'debes', 'debe', 'debemos', 'debéis', 'deben',
  'debía', 'debías', 'debíamos', 'debíais', 'debían',
  'debí', 'debiste', 'debió', 'debimos', 'debisteis', 'debieron',
  'deberé', 'deberás', 'deberá', 'deberemos', 'deberéis', 'deberán',
  'debería', 'deberías', 'deberíamos', 'deberíais', 'deberían',

  // ── PONER ─────────────────────────────────────────────────────────────────
  'poner', 'puesto', 'poniendo',
  'pongo', 'pones', 'pone', 'ponemos', 'ponéis', 'ponen',
  'ponía', 'ponías', 'poníamos', 'poníais', 'ponían',
  'puse', 'pusiste', 'puso', 'pusimos', 'pusisteis', 'pusieron',
  'pondré', 'pondrás', 'pondrá', 'pondremos', 'pondréis', 'pondrán',
  'pondría', 'pondrías', 'pondríamos', 'pondríais', 'pondrían',

  // ── VENIR ─────────────────────────────────────────────────────────────────
  'venir', 'venido', 'viniendo',
  'vengo', 'vienes', 'viene', 'venimos', 'venís', 'vienen',
  'venía', 'venías', 'veníamos', 'veníais', 'venían',
  'vine', 'viniste', 'vino', 'vinimos', 'vinisteis', 'vinieron',
  'vendré', 'vendrás', 'vendrá', 'vendremos', 'vendréis', 'vendrán',
  'vendría', 'vendrías', 'vendríamos', 'vendríais', 'vendrían',

  // ── SALIR ─────────────────────────────────────────────────────────────────
  'salir', 'salido', 'saliendo',
  'salgo', 'sales', 'sale', 'salimos', 'salís', 'salen',
  'salía', 'salías', 'salíamos', 'salíais', 'salían',
  'salí', 'saliste', 'salió', 'salisteis', 'salieron',
  'saldré', 'saldrás', 'saldrá', 'saldremos', 'saldréis', 'saldrán',
  'saldría', 'saldrías', 'saldríamos', 'saldríais', 'saldrían',

  // ── LLEVAR ────────────────────────────────────────────────────────────────
  'llevar', 'llevado', 'llevando',
  'llevo', 'llevas', 'lleva', 'llevamos', 'lleváis', 'llevan',
  'llevaba', 'llevabas', 'llevábamos', 'llevabais', 'llevaban',
  'llevé', 'llevaste', 'llevó', 'llevasteis', 'llevaron',
  'llevaré', 'llevarás', 'llevará', 'llevaremos', 'llevaréis', 'llevarán',
  'llevaría', 'llevarías', 'llevaríamos', 'llevaríais', 'llevarían',

  // ── LLEGAR ────────────────────────────────────────────────────────────────
  'llegar', 'llegado', 'llegando',
  'llego', 'llegas', 'llega', 'llegamos', 'llegáis', 'llegan',
  'llegaba', 'llegabas', 'llegábamos', 'llegabais', 'llegaban',
  'llegué', 'llegaste', 'llegó', 'llegasteis', 'llegaron',
  'llegaré', 'llegarás', 'llegará', 'llegaremos', 'llegaréis', 'llegarán',
  'llegaría', 'llegarías', 'llegaríamos', 'llegaríais', 'llegarían',

  // ── PARECER ───────────────────────────────────────────────────────────────
  'parecer', 'parecido', 'pareciendo',
  'parezco', 'pareces', 'parece', 'parecemos', 'parecéis', 'parecen',
  'parecía', 'parecías', 'parecíamos', 'parecíais', 'parecían',
  'parecí', 'pareciste', 'pareció', 'parecisteis', 'parecieron',
  'pareceré', 'parecerás', 'parecerá', 'pareceremos', 'pareceréis', 'parecerán',
  'parecería', 'parecerías', 'pareceríamos', 'pareceríais', 'parecerían',

  // ── PASAR ─────────────────────────────────────────────────────────────────
  'pasar', 'pasado', 'pasando',
  'paso', 'pasas', 'pasa', 'pasamos', 'pasáis', 'pasan',
  'pasaba', 'pasabas', 'pasábamos', 'pasabais', 'pasaban',
  'pasé', 'pasaste', 'pasó', 'pasasteis', 'pasaron',
  'pasaré', 'pasarás', 'pasará', 'pasaremos', 'pasaréis', 'pasarán',
  'pasaría', 'pasarías', 'pasaríamos', 'pasaríais', 'pasarían',

  // ── ENCONTRAR ─────────────────────────────────────────────────────────────
  'encontrar', 'encontrado', 'encontrando',
  'encuentro', 'encuentras', 'encuentra', 'encontramos', 'encontráis', 'encuentran',
  'encontraba', 'encontrabas', 'encontrábamos', 'encontrabais', 'encontraban',
  'encontré', 'encontraste', 'encontró', 'encontrasteis', 'encontraron',
  'encontraré', 'encontrarás', 'encontrará', 'encontraremos', 'encontraréis', 'encontrarán',
  'encontraría', 'encontrarías', 'encontraríamos', 'encontraríais', 'encontrarían',

  // ── SEGUIR ────────────────────────────────────────────────────────────────
  'seguir', 'seguido', 'siguiendo',
  'sigo', 'sigues', 'sigue', 'seguimos', 'seguís', 'siguen',
  'seguía', 'seguías', 'seguíamos', 'seguíais', 'seguían',
  'seguí', 'seguiste', 'siguió', 'seguisteis', 'siguieron',
  'seguiré', 'seguirás', 'seguirá', 'seguiremos', 'seguiréis', 'seguirán',
  'seguiría', 'seguirías', 'seguiríamos', 'seguiríais', 'seguirían',

  // ── ULTRA-GENERIC NOUNS / ADJECTIVES (no informational value) ─────────────
  'cosa', 'cosas', 'algo', 'nada',
  'todo', 'toda', 'todos', 'todas',
  'vez', 'veces', 'tipo', 'tipos',
  'manera', 'maneras', 'forma', 'formas',
  'parte', 'partes', 'lado', 'lados', 'caso', 'casos',
  'mucho', 'mucha', 'muchos', 'muchas',
  'poco', 'poca', 'pocos', 'pocas',
  'grande', 'grandes', 'pequeño', 'pequeña', 'pequeños', 'pequeñas',
  'nuevo', 'nueva', 'nuevos', 'nuevas',
  'viejo', 'vieja', 'viejos', 'viejas',
  'bueno', 'buena', 'buenos', 'buenas',
  'malo', 'mala', 'malos', 'malas',
  'otro', 'otra', 'otros', 'otras',
  'cierto', 'cierta', 'ciertos', 'ciertas',
  'diferente', 'diferentes', 'igual', 'iguales',
  'primero', 'primera', 'último', 'última', 'últimos', 'últimas',
]);
