(function () {
  "use strict";
  const data = window.TRIP_DATA;
  const nikko = "https://www.nikko-narita.com/english/access/bus_greet.html";
  const sapporo = "https://grand-mercure-sapporo-odoripark.jp/en/access/";
  const limousine = "https://www.limousinebus.co.jp/guide/en/";
  // Scheduled times are editable planning allowances, not confirmed transport bookings.
  const rows = [
    ["checkin-nikko", "Check in: Hotel Nikko Narita", "narita", "Hotel Nikko Narita", "2026-10-05", "20:00", 30, "Room PAID", "Two Comfort King rooms. Flora and David have breakfast; Helen does not. Estimated arrival after immigration, baggage and the hotel shuttle; adjust to actual progress.", "https://www.nikko-narita.com/english/stay/faq.html", true],
    ["checkin-mercure", "Check in: Grand Mercure Sapporo", "hokkaido", "Grand Mercure Sapporo Odori Park", "2026-10-06", "15:00", 30, "Rooms PAID", "Flora and David: Classic King with Lounge. Helen: Superior Twin with Lounge. Stay confirmed: check in 6 October, check out 14 October (8 nights). Check-in from 15:00; board time is an estimate pending your domestic flight and airport transfer.", "https://grand-mercure-sapporo-odoripark.jp/en/faq/", true],
    ["checkin-comfort", "Check in: Comfort Suites Tokyo Bay", "tokyo", "Comfort Suites Tokyo Bay, Urayasu", "2026-10-14", "17:00", 30, "Rooms PAID", "Two suites. Check-in from 15:00; 17:00 is an estimated arrival, pending the domestic flight and airport transfer. Move this block once those times are known.", "https://www.choicehotels.com/en-ca/japan/urayasu-city/comfort-suites-hotels/jp085", true],
    ["checkin-hisoca", "Check in: hotel hisoca ikebukuro", "tokyo", "hotel hisoca ikebukuro", "2026-10-17", "15:00", 30, "Rooms PAID", "Two Standard Double DS rooms with dry sauna. 15:00 is a planning estimate; confirm the check-in time on your booking. Allow the transfer from Tokyo Bay first.", "https://hotelhisoca.com/", true],
    ["bus-nikko-arrival", "Free shuttle: Narita Airport to Nikko", "narita", "Narita Airport Terminal 2 to Hotel Nikko Narita", "2026-10-05", "19:35", 25, "Free hotel shuttle", "Planning estimate after the 18:05 landing, immigration and baggage. Hotel shuttle boards at Terminal 2, first floor, stop 33, via Terminal 1. Check the current timetable and allow for queues; this is not a reserved departure.", nikko, true],
    ["bus-nikko-departure", "Free shuttle: Nikko to Narita Airport", "narita", "Hotel Nikko Narita to Narita Airport", "2026-10-06", "08:00", 30, "Free hotel shuttle", "Time not confirmed. Use only if the Sapporo flight departs Narita; a Haneda departure requires a different transfer. Confirm the terminal and leave enough time for domestic check-in.", nikko, false],
    ["bus-cts-sapporo", "Airport limousine bus: New Chitose to Sapporo", "hokkaido", "New Chitose Airport to Grand Mercure Sapporo Odori Park", "2026-10-06", "14:00", 120, "Fare to confirm", "Start time is a placeholder until the flight arrival is known. The hotel lists airport-bus access; confirm the service and stop for your arrival. Two hours is a planning allowance including waiting and onward walking, not a timetable. Grand Mercure check-in is confirmed for 6 October; align the check-in block with your actual bus arrival.", sapporo, false],
    ["bus-sapporo-cts", "Airport limousine bus: Sapporo to New Chitose", "hokkaido", "Grand Mercure Sapporo Odori Park to New Chitose Airport", "2026-10-14", "08:00", 120, "Fare to confirm", "Time depends on the domestic flight. Check the hotel-area bus stop and timetable, and allow airport check-in time after the bus journey. A rental-car return may replace this leg.", sapporo, false],
    ["bus-tokyobay", "Airport limousine bus: Tokyo airport to Tokyo Bay", "tokyo", "Tokyo airport to Urayasu / Comfort Suites Tokyo Bay", "2026-10-14", "15:00", 120, "Fare to confirm", "Arrival airport is still unknown. Select the Narita or Haneda route after the flight is confirmed. Confirm a suitable Urayasu-area stop and the final walk or taxi to Comfort Suites; a direct hotel stop is not assumed. Duration is a planning allowance.", limousine, false],
    ["transfer-hisoca", "Hotel transfer: Tokyo Bay to Hisoca Ikebukuro", "tokyo", "Comfort Suites Tokyo Bay to hotel hisoca ikebukuro", "2026-10-17", "13:00", 120, "Rail / taxi fare to confirm", "Estimated door-to-door luggage transfer. Choose rail and local transport or a taxi; this is not an airport limousine-bus route. Arrange checkout and luggage storage with Comfort Suites if leaving later than checkout time.", "https://hotelhisoca.com/", true],
    ["bus-ikebukuro-narita", "Airport limousine bus: Comfort Suites to Narita", "narita", "Comfort Suites Tokyo Bay to Narita Airport Terminal 2", "2026-10-19", "05:00", 150, "Fare / reservation to confirm", "Departure hotel: Comfort Suites Tokyo Bay, as requested. 05:00-07:30 remains a provisional door-to-door allowance, not a confirmed bus service. Confirm the boarding stop, timetable and arrival at Terminal 2 in time for MH089 at 10:05 and airline check-in requirements; a direct hotel pickup is not assumed. The recorded hotel stay is Hisoca for 17-19 October: reconcile the departure hotel or arrange travel to Comfort Suites before this leg.", limousine, true],
  ];

  const scheduled = {};
  for (const [id, title, region, area, date, start, duration, cost, note, sourceUrl, onBoard] of rows) {
    const checkin = id.startsWith("checkin-");
    const activity = { id, title, region, area, category: "Logistics", duration, defaultStart: start, cost,
      note, sourceUrl, sourceLabel: checkin ? "Hotel information" : "Transport information",
      mapQuery: area, tags: [checkin ? "hotel check-in" : "bus transfer", "trip logistics", "estimated time"],
      outsideCore: false, suggestedDate: date };
    data.activities.push(activity);
    if (onBoard) {
      const entry = { uid: `starter-${id}`, activityId: id, start, duration, notes: `ESTIMATED TIME. ${note}` };
      (data.starterSchedule[date] ||= []).push(entry);
      (scheduled[date] ||= []).push(entry);
    }
    data.floatingItems.push({ id: `plan-${id}`, activityId: id,
      label: onBoard ? "Planned - editable estimate" : "Flight time / route needed",
      detail: note, suggestedDates: [date] });
  }
  data.logisticsSchedule = scheduled;
})();
