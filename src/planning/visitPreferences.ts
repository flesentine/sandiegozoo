export type VisitPreferences = {
  date: string;
  arrival: string;
  departure: string;
  party: {
    adults: number;
    kids: number;
  };
  stroller: boolean;
  easyPaths: boolean;
  wheelchair: boolean;
  reservation: {
    name: string;
    time: string;
  };
};

const REFERENCE_DATE = "2026-09-19";

export function localISODate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createDefaultVisitPreferences(): VisitPreferences {
  const today = localISODate();

  return {
    date: today > REFERENCE_DATE ? today : REFERENCE_DATE,
    arrival: "09:00",
    departure: "17:00",
    party: {
      adults: 2,
      kids: 1,
    },
    stroller: false,
    easyPaths: false,
    wheelchair: false,
    reservation: {
      name: "",
      time: "",
    },
  };
}
