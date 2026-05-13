ROADMAP

## Milestone: Fixes and Refinements
6. can you create a undo button? and also support ctrl+z

7. I would like to move the constraints panel to the left side. when collapsed it should have the the text "Verificação de Restrições" rotated 90o degrees to make it a very discrete bar

8. can we add a print button, right after the json buttons. I think the order should be Desfazer, Pré-requisitos, Importar JSON, Exportar JSON, Gerar PDF

9. Fix hour-related constraints, for example, right now it is saying: X (falha) Núcleo IV = 400h (Estágio Supervisionado) Atual: 405h. but 405 is higher than 400 so this constraint is not a "falha". these requirements are in fact Núcleo I >= 880; Núcleo II >= 1600h; Núcleo III >= 10% of total time (it is actually 10% not explicitly 320h), so in this case you shoud write something, for example, like Núcleo III >= 335h (10% da CH total de 3350); Núcleo IV >= 400h

10. remove Métodos / TCC from the legenda, but use its color for the Formação docente — Núcleo I

11. in the legenda change the order, place 
Núcleo I - Formação docente
Núcleo II - Computação
Núcleo II - Mat. / Computação 
Núcleo II - Matemática
Núcleo II - Optativa
Núcleo III - Extensão
Núcleo IV - Estágio 

12. the Pré-requisitos button does nothing. just remembering us that showing these arrows is not an essencial feature, it is only a desired feature so if this gives us too much trouble we should ditch it

13. there is an additional constraint that, although not requiring a specific discipline, requires us to handle some content within the disciplines. I would like to discuss with you a plan to handle that. I am thinking of enabling a way to, inside a discipline popup, add to disciplines 'tags' for each of those contents that are contemplated within it. here is the list of contents and the details of its constraints to show it all on the panel

14. allow the edition of categories / colors

15. always load from json. do not have any hardcoded grid data, use default file to be imported on page load/reload, something like grade-curricular.json