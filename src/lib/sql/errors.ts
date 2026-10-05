export function explainSqlError(message: string): { title: string; hint: string } {
  const table = message.match(/no such table:\s*([^\s]+)/i)
  if (table) {
    return {
      title: `Нет таблицы ${clean(table[1])}`,
      hint: 'Имя после FROM или JOIN не совпало со схемой. Клик по карточке таблицы вставит точное имя.',
    }
  }
  const column = message.match(/no such column:\s*([^\s]+)/i)
  if (column) {
    return {
      title: `Нет столбца ${clean(column[1])}`,
      hint: 'Проверьте имя и таблицу. Если столбец есть в двух таблицах, напишите его как alias.column.',
    }
  }
  const ambiguous = message.match(/ambiguous column name:\s*([^\s]+)/i)
  if (ambiguous) {
    return {
      title: `Столбец ${clean(ambiguous[1])} есть в нескольких таблицах`,
      hint: 'Укажите таблицу или псевдоним: orders.id, а не просто id.',
    }
  }
  if (/misuse of aggregate function/i.test(message)) {
    return {
      title: 'Агрегат смешан с обычными столбцами',
      hint: 'COUNT, SUM и AVG считают по группе. Обычные столбцы из списка SELECT добавьте в GROUP BY.',
    }
  }
  const near = message.match(/near "(.+)": syntax error/i)
  if (near) {
    return {
      title: `Синтаксическая ошибка рядом с «${near[1]}»`,
      hint: 'Чаще всего не хватает запятой, скобки или ключевое слово стоит не на своём месте.',
    }
  }
  if (/incomplete input/i.test(message)) {
    return {
      title: 'Запрос оборван',
      hint: 'Не закрыта кавычка или скобка, либо после SELECT / WHERE ничего нет.',
    }
  }
  if (/UNIQUE constraint failed/i.test(message)) {
    return {
      title: 'Такое значение уже есть',
      hint: 'Первичный или уникальный ключ не принимает повтор.',
    }
  }
  if (/NOT NULL constraint failed/i.test(message)) {
    return {
      title: 'Обязательное поле пустое',
      hint: 'В INSERT не хватает столбца, у которого запрещён NULL.',
    }
  }
  return { title: message, hint: '' }
}

function clean(token: string): string {
  return token.replace(/[;,]+$/g, '')
}
