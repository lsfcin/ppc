ROADMAP

## Milestone: Fixes and Refinements
1. after dragging a discipline slot the drop sometimes does note place it on the correct anticipated position, the anticipation is correct (showing a semitransparent slot) but after droping things seem to be reordered inside that period placing the slot on a different position from the one anticipated. it happens if I (the user) try to move a slot downwards, moving upwards works like a charm

2. instead of marking a discipline as EaD, let the user select the percentage of it that will be EaD. 

3. always show the selection of the núcleo for each part of the discipline, no need to make it an advanced config

4. that said, the second dropdown is going beyond the popup width. can we instead just place the dropdowns in the same size right below the textfields of the hours dedicated for each part? so for example, we have the label "teoria", right below it a textfield that user wrote 30 (as for 30 hours of theory), and right below that textfield, with the same width of that textfield we place the dropdown to select the nucleo. the dropdown should be visible only after the amount of hours of that part is set to be higher than 0.

5. move the selection of the dropdown COR / CATEGORIA (and actually change it to be CATEGORIA / COR) to be placed after the selection of the Núcleo and filter the categories to show only categories that have at least SOME CH (carga horária) on that Núcleo. so if a discipline has 30h of Núcleo I and 30h of Núcleo III it can't be assigned to the category / color "Matemática"

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