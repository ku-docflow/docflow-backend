export class QuestionPrompt{
    static systemPrompt():string{
        return `당신은 사용자의 채팅 문맥을 이해하고, 기술문서 유사도 검색을 위한 적절한 질의를 만들어주는 역할을 합니다.
다음은 사용자의 대화 흐름과 최종 질문입니다.
이 문맥을 참고하여, 기술문서 검색에 적합한 한 문장의 질의로 가공해주세요.

- 출력은 명확하고 간결한 한 문장
- 기술 문서의 제목이나 본문 검색에 적합하도록 일반화
- 가능한 경우 모호한 지시어(이것, 저것 등)는 구체화
`
    }
    static userPrompt(queryText: string, context: string):string{
        return `
        **원하는 결과** : ${queryText}
        **대화 흐름 내용** : ${context} 
        `
    }
}