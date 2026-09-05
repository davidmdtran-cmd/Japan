(function () {
  "use strict";
  const profiles = { Shopping: 9, Food: 8, Museum: 8, Art: 8, Culture: 7, Nature: 7,
    Neighbourhood: 8, Landmark: 8, View: 7, Experience: 7, Relax: 7,
    Entertainment: 8, Cruise: 6, "Day trip": 5, "Theme park": 7,
    "Anime & games": 8, Flight: 6, Arrival: 7, Logistics: 7 };
  function rate(activity) {
    const title = String(activity.title || "").toLowerCase();
    let score = profiles[activity.category] || 6;
    const reasons = [];
    if (activity.outsideCore) { score -= 1; reasons.push("An out-of-centre visit may require extra transport."); }
    if (/hike|trail|summit|stairs|climb/.test(title)) { score -= 2; reasons.push("Walking, steps or uneven ground may make this more demanding."); }
    if (/kayak|canoe|cycling|boat tour/.test(title)) { score -= 2; reasons.push("Physical activity or boarding can add effort."); }
    if (activity.duration >= 420 && activity.category !== "Day trip") { score -= 1; reasons.push("A long outing may require rest breaks."); }
    if (/temple|shrine|garden|park/.test(title)) reasons.push("Check the chosen entrance and paths for steps and uneven surfaces.");
    if (activity.category === "Food") reasons.push("Individual restaurants may have narrow spaces, stairs or queues.");
    if (activity.id.startsWith("checkin-")) score = 9;
    if (!reasons.length) reasons.push("Estimated from the type of activity; venue-specific access has not been verified.");
    return { score: Math.max(1,Math.min(10,score)), note: `Subjective ease-of-visit estimate: higher means easier travel and less physical effort. ${reasons.join(" ")} This is not a verified wheelchair or step-free access rating.` };
  }
  window.ACCESSIBILITY_RATINGS = { rate };
})();
