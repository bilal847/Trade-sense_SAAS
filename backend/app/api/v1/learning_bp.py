from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import LearningModule, LearningLesson, Quiz, QuizAttempt, LearningProgress
from app import db

learning_bp = Blueprint('learning', __name__, url_prefix='/learning')


@learning_bp.route('/modules', methods=['GET'])
def get_learning_modules():
    """Get all learning modules."""
    try:
        modules = LearningModule.query.filter_by(is_active=True).order_by(LearningModule.order).all()
        
        return jsonify({
            'modules': [module.to_dict() for module in modules],
            'total': len(modules)
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@learning_bp.route('/modules/<int:module_id>', methods=['GET'])
def get_learning_module(module_id):
    """Get a specific learning module."""
    try:
        module = LearningModule.query.get(module_id)
        if not module or not module.is_active:
            return jsonify({'error': 'Module not found'}), 404
        
        # Get lessons for this module
        lessons = LearningLesson.query.filter_by(module_id=module_id).order_by(LearningLesson.order).all()
        
        return jsonify({
            'module': module.to_dict(),
            'lessons': [lesson.to_dict() for lesson in lessons]
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@learning_bp.route('/lessons/<int:lesson_id>', methods=['GET'])
def get_learning_lesson(lesson_id):
    """Get a specific learning lesson."""
    try:
        lesson = LearningLesson.query.get(lesson_id)
        if not lesson:
            return jsonify({'error': 'Lesson not found'}), 404
        
        # Get quiz if this lesson has one
        quiz = Quiz.query.filter_by(lesson_id=lesson_id).first()
        
        result = {
            'lesson': lesson.to_dict()
        }
        
        if quiz:
            result['quiz'] = quiz.to_dict()
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@learning_bp.route('/quizzes/<int:quiz_id>/attempt', methods=['POST'])
@jwt_required()
def attempt_quiz(quiz_id):
    """Submit a quiz attempt."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        selected_answer = data.get('selected_answer')
        if not selected_answer:
            return jsonify({'error': 'selected_answer is required'}), 400
        
        # Get quiz
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({'error': 'Quiz not found'}), 404
        
        # Check if user already attempted this quiz
        existing_attempt = QuizAttempt.query.filter_by(
            user_id=user_id,
            quiz_id=quiz_id
        ).first()
        
        if existing_attempt:
            return jsonify({'error': 'Quiz already attempted'}), 400
        
        # Create quiz attempt
        is_correct = selected_answer == quiz.correct_answer
        score = 1.0 if is_correct else 0.0
        
        attempt = QuizAttempt(
            user_id=user_id,
            quiz_id=quiz_id,
            selected_answer=selected_answer,
            is_correct=is_correct,
            score=score
        )
        
        db.session.add(attempt)
        db.session.commit()
        
        # Update learning progress
        lesson = LearningLesson.query.get(quiz.lesson_id)
        if lesson:
            progress = LearningProgress.query.filter_by(
                user_id=user_id,
                module_id=lesson.module_id
            ).first()
            
            if not progress:
                progress = LearningProgress(
                    user_id=user_id,
                    module_id=lesson.module_id,
                    lesson_id=lesson.id,
                    completed=is_correct,
                    progress_percentage=100.0 if is_correct else 0.0
                )
                db.session.add(progress)
            else:
                progress.completed = is_correct
                progress.lesson_id = lesson.id
                progress.progress_percentage = 100.0 if is_correct else 0.0
            
            db.session.commit()
        
        return jsonify({
            'attempt': attempt.to_dict(),
            'is_correct': is_correct,
            'explanation': quiz.explanation
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@learning_bp.route('/progress', methods=['GET'])
@jwt_required()
def get_learning_progress():
    """Get user's learning progress."""
    try:
        user_id = get_jwt_identity()
        
        progress_records = LearningProgress.query.filter_by(user_id=user_id).all()
        
        return jsonify({
            'progress': [progress.to_dict() for progress in progress_records],
            'total': len(progress_records)
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@learning_bp.route('/progress/<int:module_id>', methods=['POST'])
@jwt_required()
def update_learning_progress(module_id):
    """Update user's progress for a module."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        lesson_id = data.get('lesson_id')
        completed = data.get('completed', False)
        progress_percentage = data.get('progress_percentage', 0.0)
        
        # Verify module exists
        module = LearningModule.query.get(module_id)
        if not module or not module.is_active:
            return jsonify({'error': 'Module not found'}), 404
        
        # Update or create progress record
        progress = LearningProgress.query.filter_by(
            user_id=user_id,
            module_id=module_id
        ).first()
        
        if not progress:
            progress = LearningProgress(
                user_id=user_id,
                module_id=module_id,
                lesson_id=lesson_id,
                completed=completed,
                progress_percentage=progress_percentage
            )
            db.session.add(progress)
        else:
            if lesson_id:
                progress.lesson_id = lesson_id
            progress.completed = completed
            progress.progress_percentage = progress_percentage
        
        db.session.commit()
        
        return jsonify({
            'progress': progress.to_dict(),
            'message': 'Progress updated successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500