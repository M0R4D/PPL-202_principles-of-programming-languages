;; The first three lines of this file were inserted by DrRacket. They record metadata
;; about the language level of this file in a form that our tools can easily process.
#reader(lib "htdp-beginner-reader.ss" "lang")((modname q2) (read-case-sensitive #t) (teachpacks ()) (htdp-settings #(#t constructor repeating-decimal #f #t none #f () #f)))
;;#lang racket
(define last-element
    (lambda (lst)
        (if (= (length lst) 1)
        ;;(if (eq? (cdr lst) '())  
        (car lst)
        (last-element (cdr lst)))))
(last-element (list 1 3 4)) ;; expected 4
(last-element (list 5 3 9)) ;; expected 9

(define power
  (lambda (n1 n2)
    (if (= n2 1)
        n1
        (* n1 (power n1 (- n2 1))))))
(power 2 4) ;; expected 16
(power 5 3) ;; expected 125

(define sum-lst-power
  (lambda (lst n)
    (if (eq? lst '())
        0
        (+ (power (car lst) n) (sum-lst-power (cdr lst) n)))))
(sum-lst-power (list 1 4 2) 3) ;; expected 73

(define num-from-digits
    (lambda (lst)
      ;;(if (eq? lst '())
          ;;0
          ;;(+ (* (car lst) (power 10 (length (cdr lst)))) (num-from-digits (cdr lst))))))
          ;;(+ (car lst) (* 10 )))))
      (string-to-num lst 0)))

(define string-to-num
  (lambda (lst num)
    (if ( eq? lst '())
        num
        (string-to-num (cdr lst) (+ (car lst) (* 10 num))))))

(num-from-digits (list 2 4 6)) ;; expected 246
(num-from-digits (list 5 7)) ;; expected 57

(define is-narcissistic
  (lambda (lst)
    (if (= (num-from-digits lst) (sum-lst-power lst (length lst)))
        #t
        #f
        )))
(is-narcissistic (list 1 5 3)) ;; expected → #t
(is-narcissistic (list 1 2 3)) ;; expected → #f
(is-narcissistic (list 1 5 3)) ;; expected → #t

(define length
  (lambda (lst)
    (if (eq? lst '())
        0
        (+ 1 (length (cdr lst))))))
(length (list 1 2 3 4 5)) ;; expected 5
(length (list 1 2 3 5))  ;; expected 4
(length (list 1)) ;; expected 1
(length '()) ;; expected 0