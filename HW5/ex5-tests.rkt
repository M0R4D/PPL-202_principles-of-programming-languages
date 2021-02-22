#lang racket
(require rackunit)
(require "ex5.rkt")

;; Q1
(check-equal? (take (sqrt-lzl 2 1) 3) '((1 . 1) (3/2 . 1/4)  (17/12 . 1/144)) "incorrect sqrt-lzl")
(check-equal? (find-first (integers-from 1) (lambda (x) (> x 10))) 11 "incorrect find-first 1")
(check-equal? (find-first (cons-lzl 1 (lambda() (cons-lzl 2 (lambda () '())))) (lambda (x) (> x 10))) 'fail "incorrect find-first 2")
(check-equal? (sqrt2 2 1 0.0001) (+ 1 (/ 169 408)) "incorrect sqrt2")

;; Q2
(check-equal? (get-value '((a . 3) (b . 4)) 'b)  4 "incorrect get-value 1")
(check-equal? (get-value '((a . 3) (b . 4)) 'c) 'fail "incorrect get-value 2")
(check-equal? (get-value$ '((a . 3) (b . 4)) 'b (lambda(x) (* x x )) (lambda() #f)) 16 "incorrect get-value$ 1")
(check-equal? (get-value$ '((a . 3) (b . 4)) 'c (lambda(x) (* x x)) (lambda() #f)) #f "incorrect get-value$ 2")
(define l1 '((a . 1) (e . 2)))
(define l2 '((e . 5) (f . 6)))
(check-equal? (collect-all-values-1 (list l1 l2) 'e) '(2 5) "incorrect collect-all-values-1 1")
(check-equal? (collect-all-values-1 (list l1 l2) 'k) '() "incorrect collect-all-values-1 2")
(check-equal? (collect-all-values-2 (list l1 l2) 'e) '(2 5) "incorrect collect-all-values-2 1")
(check-equal? (collect-all-values-2 (list l1 l2) 'k) '() "incorrect collect-all-values-2 2")