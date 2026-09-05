(function () {
  "use strict";

  // Editorial estimates for this October trip, independent of Tabelog reviews.
  // Score order: autumn beauty, fun, novelty, once-in-a-lifetime experience.
  const profiles = {
    Food: [2, 7, 6, 4], Shopping: [2, 6, 5, 3], Culture: [5, 6, 7, 6],
    Nature: [7, 7, 6, 6], Neighbourhood: [4, 7, 6, 5], Landmark: [5, 6, 7, 6],
    Museum: [2, 7, 7, 5], Art: [3, 7, 7, 6], View: [7, 7, 7, 7],
    Experience: [3, 8, 8, 7], Relax: [4, 7, 7, 6], Entertainment: [2, 8, 6, 5],
    Cruise: [7, 8, 7, 7], "Day trip": [7, 8, 8, 7],
    "Theme park": [4, 9, 8, 8], "Anime & games": [2, 8, 8, 6],
    Flight: [2, 4, 4, 3], Arrival: [1, 3, 2, 2], Logistics: [1, 2, 2, 1],
  };
  const picks = [
    ["Tokyo Disneyland", 5, 10, 8, 9],
    ["Tokyo DisneySea", 6, 10, 10, 10],
    ["teamLab Planets", 3, 9, 10, 9],
    ["teamLab Borderless", 3, 9, 10, 9],
    ["Ghibli Museum", 5, 9, 10, 9],
    ["Warner Bros. Studio Tour Tokyo", 3, 9, 9, 8],
    ["Sanrio Puroland", 2, 9, 9, 7],
    ["Shibuya Sky", 7, 9, 8, 9],
    ["Shibuya Scramble Crossing", 3, 8, 9, 8],
    ["Hachiko statue", 2, 5, 6, 5],
    ["Tokyo Skytree", 7, 8, 8, 8],
    ["Tokyo Tower", 6, 8, 7, 8],
    ["Meiji Jingu", 6, 7, 8, 8],
    ["Senso-ji Temple", 6, 8, 9, 9],
    ["Shinjuku Gyoen National Garden", 6, 7, 6, 6],
    ["Rikugien Gardens", 5, 6, 6, 6],
    ["Koishikawa Korakuen Gardens", 6, 7, 7, 6],
    ["Kiyosumi Gardens", 6, 7, 7, 6],
    ["Nezu Museum and garden", 6, 7, 8, 7],
    ["Hama-rikyu Gardens", 6, 7, 7, 7],
    ["Meiji Jingu Gaien ginkgo avenue", 4, 6, 5, 5],
    ["Mount Takao day trip", 6, 8, 7, 7],
    ["Nikko heritage day trip", 8, 8, 9, 9],
    ["Hakone day trip", 7, 8, 8, 8],
    ["Kamakura temples day trip", 6, 8, 8, 8],
    ["Kawagoe old town day trip", 5, 8, 8, 7],
    ["Edo-Tokyo Open Air Architectural Museum", 6, 8, 9, 8],
    ["Tokyo National Museum", 4, 7, 9, 8],
    ["The Sumida Hokusai Museum", 2, 7, 8, 7],
    ["Meguro Parasitological Museum", 1, 6, 10, 6],
    ["Tokyo Metropolitan Teien Art Museum", 5, 7, 8, 7],
    ["Tokyo Metropolitan Government observatory", 6, 7, 6, 6],
    ["Art Aquarium Museum Ginza", 2, 7, 8, 6],
    ["SMALL WORLDS Miniature Museum", 2, 8, 9, 7],
    ["Akihabara arcade crawl", 2, 9, 9, 7],
    ["Akihabara Radio Kaikan", 1, 8, 8, 6],
    ["Nintendo TOKYO", 1, 8, 8, 6],
    ["Pokemon Center Shibuya", 1, 8, 8, 6],
    ["Pokemon Center Mega Tokyo", 1, 8, 8, 6],
    ["Anime Tokyo Station", 1, 8, 9, 7],
    ["Tokiwaso Manga Museum", 2, 7, 9, 7],
    ["Yotsuya Suga Shrine stairs", 3, 7, 8, 7],
    ["Omoide Yokocho", 3, 8, 8, 7],
    ["Golden Gai lanes", 3, 8, 8, 7],
    ["Kappabashi kitchenware street", 2, 8, 8, 6],
    ["Tsukiji Outer Market", 2, 9, 8, 8],
    ["Toyosu Market", 2, 7, 8, 7],
    ["Tokyo tea ceremony experience", 4, 8, 9, 8],
    ["Sushi-making class", 2, 9, 9, 8],
    ["Jozankei Onsen day trip", 9, 9, 9, 9],
    ["Hoheikyo Dam autumn trip", 10, 8, 8, 9],
    ["Futami Tsuribashi suspension bridge", 9, 7, 7, 8],
    ["Futami Jozan riverside trail", 9, 8, 7, 8],
    ["Jozankei autumn photography walk", 9, 8, 8, 8],
    ["Jozankei canoe experience", 9, 9, 9, 9],
    ["Hoheikyo Onsen day bathing", 9, 8, 9, 9],
    ["Lake Shikotsu day trip", 9, 8, 8, 9],
    ["Lake Shikotsu guided clear-kayak tour", 9, 9, 10, 9],
    ["Lake Shikotsu Marukoma Onsen", 9, 8, 9, 9],
    ["Eniwa Valley waterfalls", 9, 8, 7, 8],
    ["Noboribetsu Hell Valley", 8, 8, 10, 9],
    ["Oyunuma Pond and natural footbath", 8, 8, 9, 9],
    ["Upopoy National Ainu Museum and Park", 6, 8, 10, 9],
    ["Lake Toya day trip", 9, 8, 8, 9],
    ["Usuzan Ropeway", 9, 8, 9, 9],
    ["Showa Shinzan viewpoint", 7, 7, 9, 8],
    ["Shinsennuma marsh boardwalk", 8, 8, 8, 8],
    ["Asahidake Ropeway", 7, 8, 9, 9],
    ["Sounkyo Gorge and ropeway", 8, 8, 9, 9],
    ["Biei Blue Pond", 8, 7, 9, 8],
    ["Shirahige Falls", 9, 7, 9, 8],
    ["Shikisai no Oka", 6, 7, 7, 6],
    ["Farm Tomita in autumn", 4, 6, 6, 5],
    ["Ningle Terrace", 8, 8, 8, 8],
    ["Cape Kamui and Shakotan coast", 8, 8, 9, 9],
    ["Cape Chikyu", 8, 7, 7, 8],
    ["Otaru Canal walk", 7, 8, 8, 8],
    ["Otaru Canal cruise", 7, 8, 8, 8],
    ["Otaru Blue Cave boat tour", 7, 9, 9, 9],
    ["Otaru glass-making workshop", 2, 9, 9, 8],
    ["Mount Tengu ropeway", 8, 8, 8, 8],
    ["LeTAO Main Store", 2, 8, 7, 5],
    ["Nikka Whisky Yoichi Distillery", 6, 8, 8, 8],
    ["ROYCE Cacao & Chocolate Town", 2, 9, 9, 8],
    ["ROYCE Chocolate World", 1, 7, 7, 5],
    ["Shiroi Koibito Park", 6, 9, 8, 8],
    ["Mount Moiwa ropeway", 8, 8, 8, 9],
    ["Hokkaido University ginkgo avenue", 6, 7, 6, 6],
    ["Odori Park autumn walk", 6, 7, 5, 5],
    ["Nakajima Park", 7, 7, 6, 6],
    ["Sapporo Art Park", 8, 8, 8, 8],
    ["Takino Suzuran Hillside National Park", 8, 8, 7, 8],
    ["Hill of the Buddha", 7, 7, 10, 9],
    ["Moerenuma Park", 7, 8, 9, 8],
    ["Hokkaido Shrine", 7, 7, 8, 7],
    ["Historical Village of Hokkaido", 8, 8, 9, 8],
    ["ES CON Field Hokkaido", 3, 8, 8, 7],
    ["Sapporo Clock Tower", 3, 5, 5, 4],
    ["AOAO SAPPORO aquarium", 1, 8, 8, 7],
    ["Sapporo Beer Museum", 4, 8, 7, 7],
    ["Asahiyama Zoo", 5, 8, 8, 7],
  ];
  const overrides = new Map(picks.map(([title, ...values]) => [title.toLowerCase(), values]));
  const cache = new WeakMap();
  const metrics = [
    { key: "autumn", label: "Autumn beauty", icon: "leaf", description: "Scenery and autumn atmosphere during your October trip; not a peak-foliage forecast." },
    { key: "fun", label: "Fun", icon: "smile", description: "Enjoyment for an adult family trip, including your interest in food, anime and shopping." },
    { key: "novelty", label: "Novelty", icon: "sparkles", description: "How unusual or distinctly Japanese the experience may feel to a visitor from Perth." },
    { key: "lifetime", label: "Once-in-a-lifetime", icon: "gem", description: "Potential to become a standout travel memory; a subjective judgement, not a claim of rarity." },
  ];

  function rate(activity) {
    if (cache.has(activity)) return cache.get(activity);
    const title = String(activity.title || "").toLowerCase();
    let values = [...(profiles[activity.category] || [3, 6, 5, 4])];
    const outdoor = ["Nature", "View", "Cruise", "Day trip"].includes(activity.category);
    if (outdoor && activity.region === "tokyo") values[0] = Math.min(values[0], 6);
    if (outdoor && activity.region === "hokkaido") values[0] = Math.min(9, values[0] + 1);
    if (/garden|temple|shrine|park/.test(title) && activity.category === "Culture") values[0] = activity.region === "hokkaido" ? 7 : 5;
    if (/onsen|day bathing/.test(title)) values = [activity.region === "hokkaido" ? 7 : 3, 8, 8, 7];
    if (/workshop|cooking class|sushi-making|tea ceremony|glass-making/.test(title)) values = [2, 9, 9, 8];
    if (/stationery|bookstore|books|record.shop|loft|hands |itoya/.test(title)) values = [1, 7, 6, 3];
    if (/uniqlo|gu sapporo|costco|department store|outlet|takashimaya|mitsukoshi/.test(title)) values = [1, 6, 4, 2];
    if (/roadside station/.test(title)) values = [3, 5, 5, 2];
    if (/food hall|depachika|market|ramen street/.test(title)) values = [2, 8, 7, 5];
    if (/arcade|gachapon|gashapon|mandarake|pokemon|nintendo|animate|super potato/.test(title) && activity.category !== "Food") values = [1, 8, 8, 6];
    if (/airport/.test(title) && /onsen|observation/.test(title)) values = [2, 6, 5, 3];
    if (activity.rating && activity.category === "Food") {
      const cuisine = `${title} ${activity.note || ""}`.toLowerCase();
      values = [2, activity.rating >= 4 ? 9 : activity.rating >= 3.7 ? 8 : 7, 6, activity.rating >= 4 ? 7 : 4];
      if (/sushi|unagi|kaiseki|japanese cuisine|yakiniku|soba|tempura/.test(cuisine)) values[2] = 8;
      if (/french|italian|hamburger|burger|coffee|bread/.test(cuisine)) values[2] = 5;
    }
    const picked = overrides.get(title);
    if (picked) values = picked;
    const scores = Object.fromEntries(metrics.map((metric, i) => [metric.key, Math.max(1, Math.min(10, values[i]))]));
    const result = {
      scores,
      basis: picked ? "Place-specific editorial estimate" : "Category-based estimate, adjusted for setting and activity type",
      season: activity.region === "hokkaido"
        ? "For 6-14 October: mountain and Jozankei colour can arrive before central Sapporo. High elevations may already be past peak or wintry."
        : "For October: central Tokyo's strongest leaf colour generally arrives later, in November. Beauty also includes gardens, scenery and autumn atmosphere.",
    };
    cache.set(activity, result);
    return result;
  }

  window.ACTIVITY_RATINGS = { metrics, rate };
})();
