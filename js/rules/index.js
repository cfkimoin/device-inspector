(function () {
  "use strict";

  const rules = [];

  function register(rule) {
    rules.push(rule);
  }

  function run(snapshot) {
    const insights = [];
    for (const rule of rules) {
      try {
        const found = rule(snapshot) || [];
        for (const insight of found) insights.push(insight);
      } catch (error) {
        insights.push({
          id: `rule-error-${insights.length}`,
          severity: "info",
          title: "Rule failed",
          detail: error.message || String(error)
        });
      }
    }
    const rank = { alert: 0, watch: 1, good: 2, info: 3 };
    insights.sort((a, b) => (rank[a.severity] ?? 9) - (rank[b.severity] ?? 9));
    return insights;
  }

  window.deviceInspectorRules = { register, run };
})();
