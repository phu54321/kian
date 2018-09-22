from ngram_extractor import ngramExtract

text = '''
**_호르몬_**

|  | 친수성 | 소수성 |
| -- | -- | -- |
| 예시 | {{c1::!peptide}} | {{c1::!non-protein/steroid}} |
| receptor 위치 | {{c2::cell surface}} | {{c2::intracellular}} |
| 이중지질층 통과 | {{c3::^^X^^}} | {{c3::O}} |
| 호르몬의 최종작용 | {{c4::phosphorylation<br>transcription}} | {{c4::transcription}} |
| 작용시간 | {{c5::느림}} | {{c5::빠름}} |
'''


print(ngramExtract(text))
