
import { Tile, TileType, GameEvent, QuizQuestion } from './types';

// Board Configuration: 20 Tiles (6x6 grid perimeter)
// Indices:
// 0 (Start) -> 1-5 (Bottom Row) -> 6-9 (Right Col) -> 10-15 (Top Row) -> 16-19 (Left Col)

export const BOARD_DATA: Tile[] = [
  { id: 0, name: '출발', type: TileType.START, price: 0, rent: 0, ownerId: null, buildingLevel: 0, description: '월급을 받아요 (+500원)', icon: '🏁' },
  
  // Bottom Row
  { id: 1, name: '춘천', type: TileType.CITY, price: 200, rent: 50, ownerId: null, buildingLevel: 0, description: '호반의 도시', icon: '🏞️' },
  { id: 2, name: '퀴즈', type: TileType.QUIZ, price: 0, rent: 0, ownerId: null, buildingLevel: 0, description: '도시 상식 퀴즈!', icon: '❓' },
  { id: 3, name: '전주', type: TileType.CITY, price: 250, rent: 60, ownerId: null, buildingLevel: 0, description: '한옥마을과 맛의 고장', icon: '🍚' },
  { id: 4, name: '호수 공원', type: TileType.PARK, price: 0, rent: 0, ownerId: null, buildingLevel: 0, description: '잠시 쉬어가세요', icon: '🌳' },
  { id: 5, name: '경주', type: TileType.CITY, price: 300, rent: 80, ownerId: null, buildingLevel: 0, description: '천년의 역사', icon: '🏺' },
  
  // Right Column
  { id: 6, name: '제주', type: TileType.CITY, price: 350, rent: 90, ownerId: null, buildingLevel: 0, description: '아름다운 자연', icon: '🍊' },
  { id: 7, name: '환경 부담금', type: TileType.DONATION, price: 0, rent: 0, ownerId: null, buildingLevel: 0, description: '쓰레기를 줄입시다 (-200원)', icon: '💸' },
  { id: 8, name: '우리 고장 소식', type: TileType.EVENT, price: 0, rent: 0, ownerId: null, buildingLevel: 0, description: '무슨 일이 일어날까요?', icon: '📰' },
  { id: 9, name: '퀴즈', type: TileType.QUIZ, price: 0, rent: 0, ownerId: null, buildingLevel: 0, description: '환경 상식 퀴즈!', icon: '❓' },
  
  // Top Row
  { id: 10, name: '무인도', type: TileType.PARK, price: 0, rent: 0, ownerId: null, buildingLevel: 0, description: '1회 휴식', icon: '🏝️' },
  { id: 11, name: '대전', type: TileType.CITY, price: 450, rent: 110, ownerId: null, buildingLevel: 0, description: '과학의 도시', icon: '🧪' },
  { id: 12, name: '대구', type: TileType.CITY, price: 500, rent: 130, ownerId: null, buildingLevel: 0, description: '섬유와 패션', icon: '👕' },
  { id: 13, name: '광주', type: TileType.CITY, price: 550, rent: 150, ownerId: null, buildingLevel: 0, description: '문화 예술', icon: '🎨' },
  { id: 14, name: '세종', type: TileType.CITY, price: 600, rent: 170, ownerId: null, buildingLevel: 0, description: '행정 중심', icon: '🏛️' },
  { id: 15, name: '울산', type: TileType.CITY, price: 700, rent: 200, ownerId: null, buildingLevel: 0, description: '산업 수도', icon: '🏭' },

  // Left Column
  { id: 16, name: '부산', type: TileType.CITY, price: 800, rent: 240, ownerId: null, buildingLevel: 0, description: '해양 도시', icon: '🌊' },
  { id: 17, name: '사회 기부', type: TileType.DONATION, price: 0, rent: 0, ownerId: null, buildingLevel: 0, description: '이웃 돕기 성금 (-300원)', icon: '💝' },
  { id: 18, name: '인천 공항', type: TileType.AIRPORT, price: 0, rent: 0, ownerId: null, buildingLevel: 0, description: '원하는 곳으로 이동!', icon: '✈️' },
  { id: 19, name: '서울', type: TileType.CITY, price: 1000, rent: 350, ownerId: null, buildingLevel: 0, description: '대한민국의 수도', icon: '🇰🇷' },
];

export const GAME_EVENTS: GameEvent[] = [
  { id: 'e1', title: '환경 보호 대상', description: '재활용을 잘 실천하여 상을 받았습니다!', type: 'MONEY', value: 300 },
  { id: 'e2', title: '도로 공사', description: '도로가 공사 중이라 돌아갑니다. (2칸 뒤로)', type: 'MOVE', value: -2 },
  { id: 'e3', title: '벼룩 시장 참여', description: '안 쓰는 물건을 팔아 수익을 냈습니다.', type: 'MONEY', value: 200 },
  { id: 'e4', title: '과속 딱지', description: '속도를 위반했습니다. 벌금을 냅니다.', type: 'MONEY', value: -200 },
  { id: 'e5', title: '지하철 개통', description: '빠르게 이동합니다! (3칸 앞으로)', type: 'MOVE', value: 3 },
  { id: 'e6', title: '나무 심기 행사', description: '도시 숲 조성에 기부합니다.', type: 'MONEY', value: -100 },
  { id: 'e7', title: '우주 여행 당첨', description: '초호화 우주 여행을 떠납니다! (원하는 곳으로)', type: 'TRAVEL', value: 0 }
];

export const QUIZ_POOL: QuizQuestion[] = [
  {
    question: "다음 중 재활용이 가능한 쓰레기는 무엇일까요?",
    options: ["음식물 쓰레기", "깨진 유리", "깨끗한 페트병", "사용한 휴지"],
    correctIndex: 2,
    explanation: "깨끗하게 씻은 페트병은 재활용이 가능합니다. 나머지는 일반 쓰레기나 특수 규격 봉투에 버려야 합니다.",
    difficulty: "EASY"
  },
  {
    question: "우리 고장의 공공기관이 아닌 것은?",
    options: ["시청", "경찰서", "소방서", "대형 마트"],
    correctIndex: 3,
    explanation: "대형 마트는 물건을 사고파는 상업 시설입니다. 공공기관은 주민들의 편의를 위해 나랏일이나 공적인 일을 하는 곳입니다.",
    difficulty: "EASY"
  },
  {
      question: "지속 가능한 발전(환경 보호)을 위해 우리가 할 수 있는 일이 아닌 것은?",
      options: ["대중교통 이용하기", "일회용품 사용 줄이기", "가까운 거리는 걷기", "물 틀어놓고 양치하기"],
      correctIndex: 3,
      explanation: "물 틀어놓고 양치하기는 물을 낭비하는 행동입니다. 컵에 물을 받아 사용하는 것이 좋습니다.",
      difficulty: "EASY"
  },
  {
      question: "지도에서 학교를 나타내는 기호는 무엇일까요?",
      options: ["🏫", "🏤", "🏦", "🏨"],
      correctIndex: 0,
      explanation: "지도에서 학교는 깃발이 꽂힌 건물 모양(🏫)으로 표시합니다.",
      difficulty: "EASY"
  },
  {
      question: "다음 중 중심지의 종류가 아닌 것은?",
      options: ["행정의 중심지", "상업의 중심지", "교통의 중심지", "놀이의 중심지"],
      correctIndex: 3,
      explanation: "중심지는 사람들이 어떤 일을 하기 위해 모이는 곳으로 행정, 상업, 교통, 산업, 관광의 중심지 등이 있습니다.",
      difficulty: "MEDIUM"
  },
  {
      question: "도시 문제가 발생하는 가장 큰 원인은 무엇일까요?",
      options: ["인구가 줄어들어서", "인구가 도시에 집중되어서", "공원이 많아서", "건물이 적어서"],
      correctIndex: 1,
      explanation: "많은 사람이 좁은 도시에 모여 살기 때문에 주택, 교통, 환경 문제 등이 발생합니다.",
      difficulty: "MEDIUM"
  },
  {
      question: "주민들의 의견을 모아 지역의 중요한 일을 결정하는 곳은?",
      options: ["지방 의회", "주민 센터", "법원", "경찰서"],
      correctIndex: 0,
      explanation: "지방 의회는 주민들이 뽑은 대표들이 모여 지역의 살림살이를 의논하고 결정하는 곳입니다.",
      difficulty: "HARD"
  },
  {
      question: "우리 고장의 문화유산을 보호하는 올바른 태도는?",
      options: ["낙서를 한다", "쓰레기를 버린다", "함부로 만진다", "소중히 아끼고 관람 예절을 지킨다"],
      correctIndex: 3,
      explanation: "문화유산은 우리 조상들의 지혜가 담긴 소중한 보물이므로 아끼고 보호해야 합니다.",
      difficulty: "EASY"
  },
  {
      question: "여러 사람이 함께 사용하는 공공 시설이 아닌 것은?",
      options: ["도서관", "공원", "내 방", "박물관"],
      correctIndex: 2,
      explanation: "내 방은 나 혼자 사용하는 사적인 공간입니다. 도서관, 공원 등은 모두가 함께 쓰는 공공 시설입니다.",
      difficulty: "EASY"
  },
  {
      question: "도시와 촌락의 관계에 대한 설명으로 옳은 것은?",
      options: ["서로 도움을 주고받는다", "전혀 관계가 없다", "도시만 촌락을 돕는다", "촌락만 도시를 돕는다"],
      correctIndex: 0,
      explanation: "도시는 촌락에 공산품과 기술을 제공하고, 촌락은 도시에 농수산물과 휴식 공간을 제공하며 서로 돕습니다.",
      difficulty: "MEDIUM"
  },
  {
      question: "선거의 4대 원칙이 아닌 것은?",
      options: ["보통 선거", "평등 선거", "직접 선거", "대리 선거"],
      correctIndex: 3,
      explanation: "선거의 4대 원칙은 보통, 평등, 직접, 비밀 선거입니다. 다른 사람이 대신 투표하는 대리 선거는 안 됩니다.",
      difficulty: "HARD"
  },
  {
      question: "미세먼지를 줄이기 위한 방법으로 옳은 것은?",
      options: ["자동차 많이 타기", "나무 심기", "일회용품 많이 쓰기", "전기 낭비하기"],
      correctIndex: 1,
      explanation: "나무는 공기를 맑게 해 줍니다. 자동차 매연이나 공장 연기는 미세먼지의 원인이 됩니다.",
      difficulty: "EASY"
  },
  {
      question: "지역의 특산물을 알리기 위해 여는 행사는?",
      options: ["졸업식", "입학식", "지역 축제", "체육 대회"],
      correctIndex: 2,
      explanation: "지역 축제는 그 지역의 자연환경이나 특산물, 문화 등을 널리 알리기 위해 엽니다.",
      difficulty: "EASY"
  },
  {
      question: "지진이 났을 때 올바른 대피 요령은?",
      options: ["엘리베이터를 탄다", "책상 밑으로 들어가 머리를 보호한다", "가만히 서 있는다", "창문 옆에 있는다"],
      correctIndex: 1,
      explanation: "지진 발생 시 떨어지는 물건으로부터 몸을 보호하기 위해 튼튼한 책상 밑으로 숨어야 합니다.",
      difficulty: "EASY"
  },
  {
      question: "다음 중 지도를 그릴 때 꼭 필요한 것이 아닌 것은?",
      options: ["방위표", "기호와 범례", "축척", "내 사진"],
      correctIndex: 3,
      explanation: "지도의 3요소는 방위표, 기호와 범례, 축척입니다. 내 사진은 지도에 들어가지 않습니다.",
      difficulty: "HARD"
  },
  {
      question: "등고선에 대한 설명으로 옳은 것은?",
      options: ["바다의 깊이를 나타낸다", "땅의 높낮이를 나타낸다", "인구 수를 나타낸다", "기온을 나타낸다"],
      correctIndex: 1,
      explanation: "등고선은 지도에서 땅의 높이가 같은 곳을 연결한 선으로, 땅의 높낮이와 경사를 알 수 있습니다.",
      difficulty: "HARD"
  },
  {
      question: "우리 지역의 대표를 뽑는 선거가 있는 날은?",
      options: ["선거일", "개천절", "광복절", "어린이날"],
      correctIndex: 0,
      explanation: "선거일은 국민이 투표를 통해 대표자를 뽑는 날입니다.",
      difficulty: "EASY"
  },
  {
      question: "촌락의 종류가 아닌 것은?",
      options: ["농촌", "어촌", "산지촌", "공업촌"],
      correctIndex: 3,
      explanation: "촌락은 자연환경과 주로 하는 일에 따라 농촌, 어촌, 산지촌으로 구분합니다.",
      difficulty: "MEDIUM"
  },
  {
      question: "다음을 보고 연상되는 촌락은? [버섯 재배, 목장, 약초 캐기]",
      options: ["농촌", "어촌", "산지촌", "도시"],
      correctIndex: 2,
      explanation: "산지촌은 산간 지역에 위치하여 버섯 재배, 목축업, 약초 채취 등을 주로 합니다.",
      difficulty: "MEDIUM"
  },
  {
      question: "환경을 오염시키지 않는 에너지는 무엇일까요?",
      options: ["석탄", "석유", "천연가스", "태양열 에너지"],
      correctIndex: 3,
      explanation: "태양열, 풍력, 수력 등은 자연에서 얻을 수 있는 신재생 에너지로 환경 오염이 적습니다.",
      difficulty: "MEDIUM"
  },
  {
      question: "스마트 도시의 특징이 아닌 것은?",
      options: ["정보 통신 기술 활용", "편리한 생활", "환경 문제 해결 노력", "사람이 살지 않음"],
      correctIndex: 3,
      explanation: "스마트 도시는 첨단 기술을 활용하여 도시 문제를 해결하고 시민들이 편리하게 살 수 있도록 만든 도시입니다.",
      difficulty: "HARD"
  },
  {
      question: "다른 지역과 물건이나 정보를 주고받는 것을 무엇이라고 할까요?",
      options: ["교류", "전쟁", "단절", "고립"],
      correctIndex: 0,
      explanation: "교류는 개인이나 지역, 나라 간에 물건, 문화, 정보 등을 서로 주고받는 것을 말합니다.",
      difficulty: "HARD"
  }
];
