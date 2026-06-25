export const commentary = {
  sungnyemun: {
    changes: [
      { icon: 'home', title: { ko: '구조', en: 'Structure' },
        body: { ko: '화재로 소실된 2층 문루의 목조 구조를 전통 기법으로 다시 세웠습니다.',
                 en: 'The two-story wooden gate tower lost to fire was rebuilt with traditional methods.' } },
      { icon: 'palette', title: { ko: '단청', en: 'Dancheong' },
        body: { ko: '천연 안료를 사용해 조선 시대 단청 문양을 고증하여 복원했습니다.',
                 en: 'Joseon-era dancheong patterns were restored with natural pigments.' } },
      { icon: 'layers', title: { ko: '기와·지붕', en: 'Roof tiles' },
        body: { ko: '전통 방식으로 구운 기와로 지붕을 새로 이었습니다.',
                 en: 'The roof was re-laid with traditionally fired tiles.' } },
    ],
    modes: [
      { key: '30s', label: { ko: '30초 요약', en: '30-sec' },
        text: { ko: '숭례문은 조선의 한양도성 정문으로, 2008년 화재로 누각이 소실됐다가 2013년 전통 기법으로 복원되었습니다.',
                 en: 'Sungnyemun, the main southern gate of Joseon-era Seoul, lost its tower to a 2008 fire and was restored in 2013.' } },
      { key: 'kids', label: { ko: '어린이', en: 'Kids' },
        text: { ko: '아주 오래된 큰 대문이에요. 불이 나서 다쳤지만, 사람들이 옛날 방식 그대로 다시 고쳤답니다.',
                 en: 'A very old big gate. It was hurt by a fire, but people fixed it just like the old days.' } },
      { key: 'teen', label: { ko: '청소년 학습', en: 'Teen' },
        text: { ko: '숭례문(남대문)은 1398년 한양도성과 함께 세워진 국보 제1호입니다. 2008년 방화로 목조 누각이 소실되었고, 5년간의 복원을 거쳐 2013년 시민에게 다시 공개되었습니다.',
                 en: 'Sungnyemun (Namdaemun), National Treasure No.1, was built in 1398. A 2008 arson destroyed the wooden tower; after 5 years of restoration it reopened in 2013.' } },
      { key: 'deep', label: { ko: '심화', en: 'In-depth' },
        text: { ko: '복원 과정에서 일제강점기에 변형된 좌우 성곽 일부를 함께 복원하고, 지반을 조선 시대 원형에 가깝게 조정했습니다. 단청은 전통 아교 기법을 적용했습니다.',
                 en: 'Restoration also recovered fortress walls altered during the colonial period and adjusted the ground closer to the Joseon original, using traditional glue-based dancheong.' } },
      { key: 'foreign', label: { ko: '외국인', en: 'For visitors' },
        text: { ko: 'Sungnyemun is the iconic southern gate of old Seoul. 한국을 처음 방문하셨다면, 600년 도시의 관문을 보고 계신 거예요.',
                 en: 'Sungnyemun is the iconic southern gate of old Seoul — the gateway to a 600-year-old capital.' } },
    ],
    summaryCards: [
      { label: { ko: '시대', en: 'Era' }, value: { ko: '조선 1398년', en: 'Joseon, 1398' }, accent: 'blue' },
      { label: { ko: '인물', en: 'People' }, value: { ko: '태조 이성계', en: 'King Taejo' }, accent: 'green' },
      { label: { ko: '사건', en: 'Event' }, value: { ko: '2008 화재', en: '2008 fire' }, accent: 'red' },
      { label: { ko: '변화', en: 'Change' }, value: { ko: '2013 복원', en: '2013 restored' }, accent: 'orange' },
      { label: { ko: '의미', en: 'Meaning' }, value: { ko: '국보 제1호', en: 'Treasure No.1' }, accent: 'purple' },
    ],
    suggestedQuestions: [
      { ko: '화재는 왜 났나요?', en: 'Why did the fire happen?' },
      { ko: '복원에 얼마나 걸렸나요?', en: 'How long did restoration take?' },
      { ko: '단청이 뭔가요?', en: 'What is dancheong?' },
    ],
    quiz: [
      { q: { ko: '숭례문의 국보 번호는?', en: "Sungnyemun's National Treasure number?" },
        options: [{ ko: '제1호', en: 'No.1' }, { ko: '제2호', en: 'No.2' }, { ko: '제31호', en: 'No.31' }, { ko: '제11호', en: 'No.11' }],
        answer: 0,
        explain: { ko: '숭례문은 국보 제1호입니다.', en: 'Sungnyemun is National Treasure No.1.' } },
      { q: { ko: '화재가 발생한 해는?', en: 'Year of the fire?' },
        options: [{ ko: '2005년', en: '2005' }, { ko: '2008년', en: '2008' }, { ko: '2010년', en: '2010' }, { ko: '2013년', en: '2013' }],
        answer: 1,
        explain: { ko: '2008년 2월 방화로 누각이 소실되었습니다.', en: 'The tower was lost to arson in February 2008.' } },
      { q: { ko: '복원이 완료된 해는?', en: 'Year restoration completed?' },
        options: [{ ko: '2011년', en: '2011' }, { ko: '2012년', en: '2012' }, { ko: '2013년', en: '2013' }, { ko: '2015년', en: '2015' }],
        answer: 2,
        explain: { ko: '2013년 5월 복원이 완료되어 공개되었습니다.', en: 'Restoration was completed and reopened in May 2013.' } },
    ],
  },
}

export function getCommentary(id) {
  return commentary[id]
}
