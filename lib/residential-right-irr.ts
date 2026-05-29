export type MortalityGender = "male" | "female";

const maleMortalityRates = [
  0.003252982217792365, 0.000253504453099681, 0.000181004300268021, 0.000141275856259965,
  0.000118361171628591, 0.000104519119259219, 0.0000955231874841358, 0.0000887267016587706,
  0.0000830281477084292, 0.0000791381999065089, 0.0000778718427510832, 0.0000801773696855925,
  0.0000875474681928404, 0.000102692549671549, 0.000128719467461061, 0.000167942297304541,
  0.00022191169514489, 0.000288934655353476, 0.000360675302626123, 0.000420892244575823,
  0.00045911030095999, 0.00047571451949909, 0.000475955067757516, 0.000467392350609975,
  0.000457930015695435, 0.000454111884504008, 0.000457294658677206, 0.000467354012914261,
  0.000484459728304943, 0.000509068694649885, 0.000541934628125865, 0.000583841575622077,
  0.000634916955337595, 0.000695018488419619, 0.000763690145742223, 0.0008399694744193,
  0.000922210130400918, 0.00100930454082834, 0.00110203013300828, 0.00120164973217351,
  0.00130981394240185, 0.00142863906245712, 0.00156075818646301, 0.00170845827784849,
  0.00187351167237041, 0.00205784058296893, 0.00226355107699705, 0.00249294087925662,
  0.00274857638740083, 0.00303387851828474, 0.00335309549420306, 0.00371119503571288,
  0.00411399861421794, 0.00456834551836827, 0.00508174813658766, 0.00566050873270949,
  0.00631056348025289, 0.00703774304982325, 0.00784754187377419, 0.0087448300548849,
  0.00973313292547184, 0.0108135632628502, 0.0119847179595295, 0.0132421618107887,
  0.0145778305628244, 0.0159798432429235, 0.0174439202721759, 0.0189802758053207,
  0.0206044047603828, 0.0223370917985846, 0.0242052326620023, 0.02624194810808,
  0.0284767037855118, 0.030936638911567, 0.0336531047362384, 0.0366624978575064,
  0.0400071099452418, 0.0437405062647982, 0.0479526615447786, 0.052765211473454,
  0.0583306319332083, 0.0648405945786173, 0.0725367918412247, 0.0816754638535078,
  0.0924113165722159, 0.10485808744083, 0.119089981635739, 0.135119896586028,
  0.152877819829477, 0.172246117998383, 0.193104839977514, 0.215271808071607,
  0.238496355191918, 0.262464480789743, 0.286817135432347, 0.311307311569607,
  0.335825604277414, 0.360296537912422, 0.384673526542479, 0.40893626977335,
  0.432800065408342
];

const femaleMortalityRates = [
  0.0028899489237015985, 0.000208564902805536, 0.0001535021374502, 0.000119138772044683,
  0.0000972074274674413, 0.0000831177859832221, 0.0000742465643430127, 0.0000690696539850791,
  0.0000667419423452397, 0.0000668911998004083, 0.0000694411211868189, 0.0000745694530470407,
  0.0000827218941222462, 0.0000946510502238958, 0.000110846721271177, 0.000130905508369616,
  0.000153533601646964, 0.000176129766512634, 0.000194634524529766, 0.000204371591047457,
  0.000204838087057333, 0.000199193829156077, 0.000191067340285581, 0.000183786243633281,
  0.000180229659097627, 0.000182690332418976, 0.000191143236008199, 0.000205038719103522,
  0.000223987375089513, 0.000247513612509035, 0.000274815030885283, 0.000304974826694904,
  0.000337925913526434, 0.000373760070934366, 0.000412532473777396, 0.000454252322025017,
  0.000498876026258083, 0.000546500006613288, 0.000597568666699474, 0.000652687477308567,
  0.000712626875877095, 0.000778355715539586, 0.00085106819732544, 0.000931936253832715,
  0.00102207468245868, 0.00112276372755646, 0.00123548673682681, 0.00136196616663151,
  0.00150413642290508, 0.00166361923214834, 0.0018418013721236, 0.00203999791720467,
  0.00225938740264671, 0.00250093150542691, 0.00276581971261618, 0.00305742902865138,
  0.0033805168711636, 0.00374099638125154, 0.00414621241131877, 0.00460527915353037,
  0.00512618405021282, 0.0057103296092879, 0.00635590617585459, 0.00705773161241916,
  0.00780635103353351, 0.00858766985657791, 0.00939706533883071, 0.0102481589005478,
  0.0111615682065409, 0.0121651146791532, 0.0132953803307166, 0.0145978273950803,
  0.0161026357946498, 0.0178253142344425, 0.019779317876421, 0.021974708140712,
  0.0244162325532089, 0.0271113795670014, 0.0301255676517723, 0.033568436209809,
  0.0375858074174125, 0.0423716007372693, 0.0481850748059717, 0.0553172323513827,
  0.0639565804963389, 0.0742531585434048, 0.0863156026488834, 0.100178622552946,
  0.115768451112632, 0.132967673844126, 0.151708151965154, 0.171875439029445,
  0.193296404167701, 0.215741287821606, 0.238938125492772, 0.26273303835788,
  0.287124134474646, 0.312155973590352, 0.337911111834553, 0.364503131080566,
  0.385673202020936
];

const millisecondsPerDay = 24 * 60 * 60 * 1000;

function mortalityRate(age: number, gender: MortalityGender): number {
  const table = gender === "female" ? femaleMortalityRates : maleMortalityRates;
  const index = Math.max(0, Math.min(table.length - 1, Math.trunc(age)));
  return table[index] ?? 0;
}

function asUtcDate(value?: Date | string): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  return new Date(value);
}

function endOfMonthAfterMonths(start: Date, months: number): Date {
  return new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + months + 1, 0));
}

function yearsBetween(start: Date, end: Date): number {
  return Math.max(1 / 365, (end.getTime() - start.getTime()) / millisecondsPerDay / 365);
}

function annualReturn(initialOutflow: number, netExit: number, start: Date, durationYears: number): number {
  const end = endOfMonthAfterMonths(start, durationYears * 12);
  return Math.pow(netExit / initialOutflow, 1 / yearsBetween(start, end)) - 1;
}

export type WeightedIrrInput = {
  marketValue: number;
  payoutAmount: number;
  maintenanceCost: number;
  durationYears: number;
  mortalityAge: number;
  mortalityGender: MortalityGender;
  acquisitionCostRate?: number;
  salesCostRate?: number;
  exitValueGrowthRate?: number;
  maintenanceUsageRate?: number;
  calculationDate?: Date | string;
};

export type WeightedIrrResult = {
  weightedIrr: number;
  survivalProbability: number;
  deathProbabilities: number[];
  scenarioIrrs: number[];
  initialOutflow: number;
  acquisitionCost: number;
  maintenanceReserve: number;
};

export function calculateMortalityWeightedIrr(input: WeightedIrrInput): WeightedIrrResult {
  const durationYears = Math.max(1, Math.trunc(input.durationYears));
  const acquisitionCostRate = input.acquisitionCostRate ?? 0.08;
  const salesCostRate = input.salesCostRate ?? 0.015;
  const exitValueGrowthRate = input.exitValueGrowthRate ?? 0.02;
  const maintenanceUsageRate = input.maintenanceUsageRate ?? 0.7;
  const acquisitionCost = input.marketValue * acquisitionCostRate;
  const maintenanceReserve = input.maintenanceCost * maintenanceUsageRate;
  const initialOutflow = input.payoutAmount + acquisitionCost + maintenanceReserve;
  const start = asUtcDate(input.calculationDate);

  if (initialOutflow <= 0 || input.marketValue <= 0) {
    return {
      weightedIrr: 0,
      survivalProbability: 1,
      deathProbabilities: [],
      scenarioIrrs: [],
      initialOutflow,
      acquisitionCost,
      maintenanceReserve
    };
  }

  const deathProbabilities = Array.from({ length: Math.max(0, durationYears - 1) }, (_, index) =>
    mortalityRate(input.mortalityAge + index, input.mortalityGender)
  );
  const deathProbabilitySum = deathProbabilities.reduce((sum, value) => sum + value, 0);
  const survivalProbability = Math.max(0, 1 - deathProbabilitySum);
  const scenarioIrrs = Array.from({ length: durationYears }, (_, index) => {
    const year = index + 1;
    const exitValue = input.marketValue * Math.pow(1 + exitValueGrowthRate, year);
    const netExit = exitValue * (1 - salesCostRate);
    return annualReturn(initialOutflow, netExit, start, year);
  });
  const weightedDeathIrr = deathProbabilities.reduce((sum, probability, index) => sum + probability * scenarioIrrs[index], 0);
  const weightedIrr = weightedDeathIrr + survivalProbability * scenarioIrrs[durationYears - 1];

  return {
    weightedIrr,
    survivalProbability,
    deathProbabilities,
    scenarioIrrs,
    initialOutflow,
    acquisitionCost,
    maintenanceReserve
  };
}

export function solvePayoutForTargetWeightedIrr(input: Omit<WeightedIrrInput, "payoutAmount"> & { targetReturn: number }) {
  const lowPayout = 0;
  let highPayout = input.marketValue;
  const irrAtLow = calculateMortalityWeightedIrr({ ...input, payoutAmount: lowPayout }).weightedIrr;
  const irrAtHigh = calculateMortalityWeightedIrr({ ...input, payoutAmount: highPayout }).weightedIrr;

  if (input.targetReturn >= irrAtLow) {
    const result = calculateMortalityWeightedIrr({ ...input, payoutAmount: lowPayout });
    return { payoutAmount: lowPayout, ...result, bounded: true };
  }

  if (input.targetReturn <= irrAtHigh) {
    const result = calculateMortalityWeightedIrr({ ...input, payoutAmount: highPayout });
    return { payoutAmount: highPayout, ...result, bounded: true };
  }

  let low = lowPayout;
  let high = highPayout;
  for (let index = 0; index < 80; index += 1) {
    const mid = (low + high) / 2;
    const irr = calculateMortalityWeightedIrr({ ...input, payoutAmount: mid }).weightedIrr;
    if (irr > input.targetReturn) {
      low = mid;
    } else {
      high = mid;
    }
  }

  highPayout = (low + high) / 2;
  const result = calculateMortalityWeightedIrr({ ...input, payoutAmount: highPayout });
  return { payoutAmount: highPayout, ...result, bounded: false };
}
