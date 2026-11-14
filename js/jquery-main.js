// jQuery 3.7.1 - Feature for the contact page only.
// Cart is fully plain JS (main.js). jQuery is used here only for contact form validation.
$(function () {

    // Limit the jQuery validator to the actual contact form
    // (otherwise delivery.html with .contact-form class will fail on $name.val()).
    var $contactForm = $(".contact-form").filter(function () {
        return $(this).find("#message").length > 0;
    });

    if (!$contactForm.length) return;

    $contactForm[0].noValidate = true;

    $contactForm.on("submit", function (event) {
        event.preventDefault();

        var $form = $(this);
        var isValid = true;

        $form.find(".form-result.error").remove();
        $form.find(".error").removeClass("error");

        var $name = $form.find("#name");
        if ($name.val().trim().length < 2) {
            $name.addClass("error");
            $("<p>").addClass("form-result error")
                .text("Please write your name")
                .insertAfter($name)
                .slideDown(200);
            isValid = false;
        }

        var $email = $form.find("#email");
        var emailRegex = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i;
        if (!emailRegex.test($email.val().trim())) {
            $email.addClass("error");
            $("<p>").addClass("form-result error")
                .text("Please write a correct email")
                .insertAfter($email)
                .slideDown(200);
            isValid = false;
        }

        var $message = $form.find("#message");
        if ($message.val().trim().length < 10) {
            $message.addClass("error");
            $("<p>").addClass("form-result error")
                .text("Message must be at least 10 characters")
                .insertAfter($message)
                .slideDown(200);
            isValid = false;
        }

        if (isValid) {
            var $result = $form.find("#contact-result");
            $result.removeClass("hidden")
                .text("Demo message — nothing was sent. We would reply within 24 hours.")
                .fadeIn(300, function () {
                    $form[0].reset();
                });
        }
    });

    // Error clearing on input (delegated: works for future messages)
    $contactForm.on("input", "input, textarea", function () {
        var $field = $(this);
        $field.removeClass("error");
        $field.siblings(".form-result.error").slideUp(200, function () {
            $(this).remove();
        });
    });

});