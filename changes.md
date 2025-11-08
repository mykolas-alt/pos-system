- Data modelyje, Order skiltyje, customerId UUID yra pažymėtas, tačiau niekur kitur diagramoje
jis nėra aprašytas, todėl pagal diagramas neturi prasmės
  - pataisymas: -


- Data modelyje, OrderItem skiltyje, itemId pavadinimas nėra pilnai aiškus iš pirmo žvilgsnio -
tikriausiai turėta omenyje orderItemId primary key.
- ten pat quantity yra integer, tačiau žmonės gali pirkti nebūtinai visas porcijas (kilogramais ar panašiai)
  - pataisymas: pervadinimas ir tipo pakeitimas
