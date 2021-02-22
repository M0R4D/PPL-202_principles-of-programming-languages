:- module('ex5',
        [activity/2,
         parents/3,
         participate/2,
         parent_details/3,
         not_member/2
        ]).

/*
 * **********************************************
 * Printing result depth
 *
 * You can enlarge it, if needed.
 * **********************************************
 */
maximum_printing_depth(100).

:- current_prolog_flag(toplevel_print_options, A),
   (select(max_depth(_), A, B), ! ; A = B),
   maximum_printing_depth(MPD),
   set_prolog_flag(toplevel_print_options, [max_depth(MPD)|B]).
   
% Signature: activity(Name,Day)/2
% Purpose: describe an activity at the country club and the day it takes place
%
activity(swimming,sunday).
activity(ballet,monday).
activity(judu,tuesday).
activity(soccer,wednesday).
activity(art,sunday).
activity(yoga,tuesday).

% Signature: parents(Child,Parent1,Parent2)/3
% Purpose: parents - child relation
%
parents(dany,hagit,yossi).
parents(dana,hagit,yossi).
parents(guy,meir,dikla).
parents(shai,dor,meni).

% Signature: participate(Child_name,Activity)/2
% Purpose: registration details
%
participate(dany,swimming).
participate(dany,ballet).
participate(dana,soccer).
participate(dana,judu).
participate(guy,judu).
participate(shai,soccer).

% Signature: parent_details(Name,Phone,Has_car)/3
% Purpose: parents details
%
parent_details(hagit,"0545661332",true).
parent_details(yossi,"0545661432",true).
parent_details(meir,"0545661442",false).
parent_details(dikla,"0545441332",true).
parent_details(dor,"0545881332",false).
parent_details(meni,"0545677332",true).

% Signature: not_member(Element, List)/2
% Purpose: The relation in which Element is not a member of a List.
%
not_member(_, []).
not_member(X, [Y|Ys]) :- X \= Y,
        not_member(X, Ys).


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

% Signature: pick_me_up(Child_name,Phone)/2
% Purpose: defines the relation between a child name and its parent phone number, when the parent has a car
%
pick_me_up(Child, Phone) :- parents(Child, Parent1, _) , parent_details(Parent1, Phone, true). %1
pick_me_up(Child, Phone) :- parents(Child, _, Parent2) , parent_details(Parent2, Phone, true). %2


% Signature: active_child(Name)/1
% Purpose: true when a child participates in at least two activities
%
active_child(Child) :- participate(Child, X), participate(Child, Y), X \= Y. %1


% For parts c+d, you can use findall/3 or bagof/3 of Prolog.

% Signature: activity_participants_list(Name, List)/2
% Purpose: relationship between an activity name and list of all the children's names that participate at this activity (without repetition).'
%
activity_participants_list(Name, List) :- activity(Name,_), findall(A,participate(A,Name),List). %1

% Signature: can_register(Child_name, Activity)/2
% Purpose: defines the relation between a child name and an activity that the child can register to (the child is available at the day the activity takes place).
%
isNotParticipate(Child_name, Activity) :- activity(Activity, _),
	findall(A,participate(A, Activity), List), not_member(Child_name, List).

activityDay(Child_name,Day):- participate(Child_name, A), activity(A, Day).

can_register(Child_name, Activity):- parents(Child_name, _, _), isNotParticipate(Child_name, Activity),
    findall(D, activityDay(Child_name, D),List), activity(Activity, D),
    not_member(D, List). %1
