package utils

import (
    "net/smtp"
    "fmt"
)

func SendEmail(to string, subject string, body string) error {
    smtpServer := "smtp.gmail.com"
    auth := smtp.PlainAuth("", "nickpastrana15@gmail.com", "giio ogee pmmb nnls", smtpServer)

    msg := fmt.Sprintf("From: %s\nTo: %s\nSubject: %s\n\n%s", "nickpastrana15@gmail.com", to, subject, body)

    err := smtp.SendMail(smtpServer+":587", auth, "nickpastrana15@gmail.com", []string{to}, []byte(msg))
    if err != nil {
        return err
    }

    return nil
}
