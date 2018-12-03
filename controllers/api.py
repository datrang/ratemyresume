# Here go your api methods.


@auth.requires_signature()
def add_post():
    post_id = db.post.insert(
        post_title=request.vars.post_title,
        post_content=request.vars.post_content,
    )
    # We return the id of the new post, so we can insert it along all the others.
    return response.json(dict(post_id=post_id))


@auth.requires_signature()
def edit_post():
    post_id = int(request.vars.post_id)
    post_content = request.vars.post_content
    # print(post_content)
    db.post.update_or_insert(
        (db.post.id == post_id) & (db.post.post_author == auth.user.email),
        id=post_id,
        post_author=auth.user.email,
        post_content=post_content
    )

@auth.requires_signature()
def edit_reply():
    post_id = int(request.vars.post_id)
    reply_id = int(request.vars.reply_id)
    reply_content = request.vars.reply_content
    db.reply.update_or_insert(
        (db.reply.id == reply_id) & (db.reply.post_id == post_id) & (db.reply.reply_author == auth.user.email),
        id=reply_id,
        reply_author=auth.user.email,
        reply_content=reply_content
    )


@auth.requires_signature()
def set_thumb():
    post_id = int(request.vars.post_id)
    thumb_state = request.vars.thumb_state
    if thumb_state == '':
        thumb_state = None
    # print(thumb_state)
    db.thumb.update_or_insert(
        (db.thumb.post_id == post_id) & (db.thumb.user_email == auth.user.email),
        post_id=post_id,
        thumb_state=thumb_state,
        user_email=auth.user.email
    )


@auth.requires_signature()
def add_reply():
    post_id = int(request.vars.post_id)
    print(post_id)
    reply_id = db.reply.insert(
        reply_content=request.vars.reply_content,
        post_id=int(request.vars.post_id),
        reply_author=auth.user.email
    )
    return response.json(dict(reply_id=reply_id))


# Gets the number of thumbs that is not the current user
def get_thumb_count(post_id):
    rows = db().select(db.thumb.ALL)
    thumb_count = 0
    for row in rows:
        if row['user_email'] != auth.user.email:
            if row['post_id'] == post_id:
                if row['thumb_state'] == 'u':
                    thumb_count = thumb_count + 1
                elif row['thumb_state'] == 'd':
                    thumb_count = thumb_count - 1
    return thumb_count


def is_author(post_author):
    # print(auth.user)
    if auth.user.email == post_author:
        return True
    else:
        return False


def get_reply_list(post_id):
    results = []
    rows = db().select(db.reply.ALL)
    for row in rows:
        # print("row = ", row)
        #  print("post_id = ", row.post_id)
        #  print(db.reply.post_id, " =? ", post_id)
        if row.post_id == post_id:
            row_is_author = is_author(row.reply_author)
            results.append(dict(
                id=row.id,
                reply_content=row.reply_content,
                reply_author=row.reply_author,
                is_author=row_is_author
            ))
    return results


def get_post_list():
    results = []
    if auth.user is None:
        # Not logged in.
        rows = db().select(db.post.ALL, orderby=~db.post.post_time)
        for row in rows:
            results.append(dict(
                id=row.id,
                post_title=row.post_title,
                post_content=row.post_content,
                post_author=row.post_author,
                thumb=None,
                reply_list=[]
            ))
    else:
        # Logged in.
        rows = db().select(db.post.ALL, db.thumb.ALL,
                           left=[
                               db.thumb.on((db.thumb.post_id == db.post.id) & (db.thumb.user_email == auth.user.email)),
                           ],
                           orderby=~db.post.post_time)
        for row in rows:
            row_thumb_count = get_thumb_count(row.post.id)
            row_is_author = is_author(row.post.post_author)
            row_reply_list = get_reply_list(row.post.id)
            results.append(dict(
                id=row.post.id,
                post_title=row.post.post_title,
                post_content=row.post.post_content,
                post_author=row.post.post_author,
                thumb_count=row_thumb_count,
                thumb=None if row.thumb.id is None else row.thumb.thumb_state,
                is_author=row_is_author,
                reply_list=row_reply_list
            ))
        print(results)
    # For homogeneity, we always return a dictionary.
    return response.json(dict(post_list=results))


    

