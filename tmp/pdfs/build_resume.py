from pathlib import Path
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader

out = Path('D:/Projetos/api/output/pdf')
out.mkdir(parents=True, exist_ok=True)
pdfmetrics.registerFont(TTFont('Arial', 'C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Bold', 'C:/Windows/Fonts/arialbd.ttf'))
pdfmetrics.registerFontFamily('Arial', normal='Arial', bold='Arial-Bold', italic='Arial', boldItalic='Arial-Bold')
styles = {
 'name': ParagraphStyle('name', fontName='Arial-Bold', fontSize=20, leading=24, spaceAfter=4),
 'title': ParagraphStyle('title', fontName='Arial-Bold', fontSize=11, leading=14, spaceAfter=5),
 'body': ParagraphStyle('body', fontName='Arial', fontSize=9.5, leading=12.6, spaceAfter=4),
 'section': ParagraphStyle('section', fontName='Arial-Bold', fontSize=11, leading=14, spaceBefore=10, spaceAfter=5, textColor=colors.HexColor('#18364b')),
 'small': ParagraphStyle('small', fontName='Arial', fontSize=9, leading=12, spaceAfter=3),
 'bullet': ParagraphStyle('bullet', fontName='Arial', fontSize=9.5, leading=12.6, leftIndent=9, firstLineIndent=-7, spaceAfter=3),
}
story=[]
plain=[]
def add(text, kind='body'):
 story.append(Paragraph(text, styles[kind]))
 import re
 plain.append(re.sub('<[^>]+>', '', text))

add('Juan Ygor Delgado', 'name')
add('Objetivo: Estágio em Desenvolvimento Backend | Java e Spring Boot', 'title')
add('Mogi Guaçu - SP | (19) 97133-1075 | juanygor10@icloud.com', 'small')
add('<link href="https://www.linkedin.com/in/pcthelab">linkedin.com/in/pcthelab</link> | <link href="https://github.com/Pcthelab">github.com/Pcthelab</link>', 'small')
add('RESUMO PROFISSIONAL', 'section')
add('Estudante de Análise e Desenvolvimento de Sistemas na Fatec, com conclusão prevista para junho de 2028. Desenvolvimento de projetos com APIs REST em Java/Spring Boot e C#/.NET, bancos relacionais e integração com React. Experiência profissional na Cortag com automação de processos em Excel e utilização de ERP e WMS.')
add('FORMAÇÃO ACADÊMICA', 'section')
add('<b>Tecnologia em Análise e Desenvolvimento de Sistemas - Fatec</b><br/>Em andamento | Conclusão prevista: 06/2028')
add('COMPETÊNCIAS TÉCNICAS', 'section')
add('<b>Backend:</b> Java, Spring Boot, Spring Security, APIs REST, JWT, C#, .NET.<br/><b>Dados:</b> PostgreSQL, SQL Server, JPA/Hibernate, Entity Framework Core.<br/><b>Frontend:</b> React, JavaScript, TypeScript, HTML5, CSS3.<br/><b>Testes e ferramentas:</b> JUnit 5, Postman, Git, GitHub, Maven, Docker Compose.<br/><b>Processos e sistemas:</b> Excel Avançado, ERP Datasul, WMS Stockbox.')
add('PROJETOS', 'section')
add('<b>OmniCash - Gestão financeira pessoal | 2026</b><br/>Java 21, Spring Boot, Spring Security, JPA/Hibernate, PostgreSQL, React e Vite')
add('- Desenvolvi API REST para receitas, despesas e categorias, com autenticação JWT, senhas protegidas com BCrypt e registros associados ao usuário autenticado.', 'bullet')
add('- Integrei a API a uma interface React responsiva com filtros, saldo por período, relatórios por categoria, evolução financeira em seis meses e exportação CSV.', 'bullet')
add('Repositório: <link href="https://github.com/Pcthelab/OmniCash">github.com/Pcthelab/OmniCash</link>', 'small')
add('<b>Sistema de Proteção Judicial - Projeto acadêmico, Fatec | 2025</b><br/>Java, Spring Boot e PostgreSQL')
add('- Projeto de backend voltado ao contexto de proteção judicial em casos de violência doméstica, com foco na integridade e confidencialidade de dados sensíveis.', 'bullet')
add('<b>CashFlowProject - Gestão corporativa | 2026</b><br/>C# (.NET 10), React e TypeScript')
add('- Desenvolvi API REST com regras de negócio para lançamentos financeiros e relatórios consolidados.', 'bullet')
add('EXPERIÊNCIA PROFISSIONAL', 'section')
add('<b>Cortag | Assistente Operacional - Logística e Exportação | 2024 - 2026</b>')
add('- Desenvolvi automações em Excel para endereçamento e roteirização de materiais, eliminando buscas manuais e reduzindo o tempo de separação dos operadores.', 'bullet')
add('- Utilizei ERP Datasul e WMS Stockbox na emissão de notas fiscais de exportação, controle de inventário e acompanhamento da acuracidade de estoque.', 'bullet')
add('CURSOS E CERTIFICAÇÕES', 'section')
add('Itaú - Java com Inteligência Artificial | DIO | 45h | 08/2026<br/>Java COMPLETO: Do Zero ao Profissional | Udemy | 77h | 08/2026<br/>Scrum Fundamentals Certified | SCRUMstudy | 08/2026', 'small')
add('IDIOMAS', 'section')
add('Inglês intermediário: leitura e escrita técnica; conversação básica a intermediária.', 'small')
path=out/'Juan_Ygor_Delgado_Curriculo_Backend.pdf'
SimpleDocTemplate(str(path), pagesize=(595.28,841.89), rightMargin=36, leftMargin=36, topMargin=30, bottomMargin=28, title='Juan Ygor Delgado - Currículo Backend', author='Juan Ygor Delgado').build(story)
reader=PdfReader(path)
assert len(reader.pages)==1, len(reader.pages)
text='\n'.join(p.extract_text() for p in reader.pages)
assert 'OmniCash' in text and 'Fluxo Control' not in text
(out/'Juan_Ygor_Delgado_Curriculo_Backend.txt').write_text('\n\n'.join(plain), encoding='utf-8')
print(f'PDF validado: {len(reader.pages)} página; {len(text)} caracteres extraídos.')
