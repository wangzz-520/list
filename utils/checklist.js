function normalizeGroups(templateGroups, draft) {
  const checkedMap = draft.checkedMap || {};
  const deletedIds = draft.deletedIds || [];
  const extraItemsByGroup = draft.extraItemsByGroup || {};

  return (templateGroups || []).map((group, groupIndex) => {
    const baseItems = (group.items || []).map((item, itemIndex) => {
      const text = typeof item === 'string' ? item : item.text;
      const id = typeof item === 'string' ? `${group.id || groupIndex}_${itemIndex}` : item.id;
      return {
        id,
        text,
        checked: !!checkedMap[id],
        custom: !!(typeof item !== 'string' && item.custom)
      };
    }).filter(item => !deletedIds.includes(item.id));

    const extras = (extraItemsByGroup[group.id] || []).map(item => ({
      ...item,
      checked: !!checkedMap[item.id],
      custom: true
    })).filter(item => !deletedIds.includes(item.id));

    return {
      id: group.id || `group_${groupIndex}`,
      name: group.name || `分组 ${groupIndex + 1}`,
      items: [...baseItems, ...extras]
    };
  });
}

function calcProgress(groups) {
  const items = (groups || []).reduce((rows, group) => rows.concat(group.items || []), []);
  const total = items.length;
  const done = items.filter(item => item.checked).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total, done, percent };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

module.exports = {
  normalizeGroups,
  calcProgress,
  clone
};
