# Code from https://github.com/baitisj/anki-reset-card-scheduling

import random

from utils import (
    Col,
    checkpoint,
    registerApi,
    typeCheck,
    emit,
)


@registerApi
def cardSchedReset(msg):
    typeCheck(msg, {
        'cardIds': list
    })
    cids = msg['cardIds']
    with Col() as col:
        checkpoint(col, "Reset scheduling and learning on selected cards")
        col.sched.resetCards(cids)
        col.sched.removeLrn(cids)
        col.reset()
        return emit.emitResult(True)


@registerApi
def cardSchedReschedule(msg):
    typeCheck(msg, {
        'cardIds': list,
        'minDue': int,
        'maxDue': int
    })
    cids = msg['cardIds']
    with Col() as col:
        checkpoint(col, 'Change card dues')
        minDue = (msg['minDue'] - col.crt) // 86400
        maxDue = (msg['maxDue'] - col.crt) // 86400
        for cid in cids:
            card = col.getCard(cid)
            oldDue = card.due

            if card.queue == 0 or card.type == 0:  # Ignore for new cards
                continue

            # TODO: Properly calculate the next interval using learning curve
            oldDue = card.due
            newDue = random.randint(minDue, maxDue)
            print(oldDue, newDue)

            card.type = 2
            card.queue = 2
            card.due = newDue
            card.ivl += newDue - oldDue
            card.flush()
        col.reset()
        return emit.emitResult(True)
