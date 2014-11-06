console.log("loaded");
document.addEventListener('DOMContentLoaded', function () {
    var stack;

    stack = gajus.Swing.Stack();

    [].forEach.call(document.querySelectorAll('.stack li'), function (targetElement) {
        stack.createCard(targetElement);
        targetElement.classList.add('in-deck');
    });

    stack.on('throwout', function (e) {
        console.log(e.target.innerText || e.target.textContent, 'has been thrown out of the stack to the',
        // Picture swipe direction, implement functions
        e.throwDirection == 1 ? function() {console.log("accepted");} : function() {console.log("decline");}, 'direction.');

        e.target.classList.remove('on-top');
    });

    // stack.on('throwin', function (e) {
    //     console.log(e.target.innerText || e.target.textContent, 'has been thrown into the stack from the',
    //     e.throwDirection == 1 ? 'right' : 'left', 'direction.');
    //
    //     e.target.classList.add('in-deck');
    // });
});
